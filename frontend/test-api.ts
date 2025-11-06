/**
 * API Testing Script
 *
 * Run with: npx ts-node frontend/test-api.ts
 *
 * Tests all API endpoints to verify migration
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  responseTime: number;
  error?: string;
  cached?: boolean;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  requiresAuth: boolean = false
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' as RequestCredentials,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const responseTime = Date.now() - startTime;

    const isCached = response.headers.get('x-vercel-cache') === 'HIT' ||
                     response.headers.get('cache-control')?.includes('public');

    if (response.status === 401 && requiresAuth) {
      return {
        endpoint,
        method,
        status: 'SKIP',
        responseTime,
        error: 'Requires authentication (expected)'
      };
    }

    if (response.ok) {
      return {
        endpoint,
        method,
        status: 'PASS',
        responseTime,
        cached: isCached
      };
    }

    const errorText = await response.text();
    return {
      endpoint,
      method,
      status: 'FAIL',
      responseTime,
      error: `${response.status} ${response.statusText}: ${errorText}`
    };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      method,
      status: 'FAIL',
      responseTime,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  console.log(`📡 Testing against: ${API_BASE}\n`);
  console.log('=' .repeat(80));

  // Edge Runtime Tests (Should be fast: 50-200ms)
  console.log('\n🌍 EDGE RUNTIME TESTS (Read-Only)');
  console.log('-'.repeat(80));

  results.push(await testEndpoint('/api/leagues', 'GET'));
  results.push(await testEndpoint('/api/teams', 'GET'));
  results.push(await testEndpoint('/api/teams?leagueId=1', 'GET'));
  results.push(await testEndpoint('/api/matches', 'GET'));
  results.push(await testEndpoint('/api/matches?leagueId=1&limit=10', 'GET'));
  results.push(await testEndpoint('/api/leaderboard', 'GET'));
  results.push(await testEndpoint('/api/leaderboard?leagueId=1', 'GET'));
  results.push(await testEndpoint('/api/standings?leagueId=1', 'GET'));
  results.push(await testEndpoint('/api/gameweeks?leagueId=1', 'GET'));

  // Node Runtime Tests (Should be 150-300ms)
  console.log('\n🖥️  NODE RUNTIME TESTS (Auth & Writes)');
  console.log('-'.repeat(80));

  results.push(await testEndpoint('/api/auth/me', 'GET', undefined, true));
  results.push(await testEndpoint('/api/predictions', 'GET', undefined, true));
  results.push(await testEndpoint('/api/groups', 'GET', undefined, true));

  // Print Results
  console.log('\n📊 TEST RESULTS');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' :
                 result.status === 'FAIL' ? '❌' : '⏭️ ';

    const cached = result.cached ? '📦 CACHED' : '';
    const timing = result.responseTime < 100 ? '⚡ FAST' :
                   result.responseTime < 300 ? '✓ OK' : '🐌 SLOW';

    console.log(`${icon} ${result.method} ${result.endpoint}`);
    console.log(`   ${timing} ${result.responseTime}ms ${cached}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });

  // Summary
  console.log('='.repeat(80));
  console.log(`\n📈 SUMMARY: ${passed} passed | ${failed} failed | ${skipped} skipped\n`);

  // Performance Analysis
  const edgeResults = results.slice(0, 9); // First 9 are Edge
  const avgEdgeTime = edgeResults
    .filter(r => r.status === 'PASS')
    .reduce((sum, r) => sum + r.responseTime, 0) / edgeResults.filter(r => r.status === 'PASS').length;

  console.log('⚡ PERFORMANCE METRICS');
  console.log('-'.repeat(80));
  console.log(`Average Edge Runtime Response: ${avgEdgeTime.toFixed(0)}ms`);
  console.log(`Target: < 150ms ${avgEdgeTime < 150 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cache Hit Rate: ${results.filter(r => r.cached).length}/${results.length} (${(results.filter(r => r.cached).length / results.length * 100).toFixed(0)}%)`);
  console.log(`Target: > 70% ${(results.filter(r => r.cached).length / results.length) > 0.7 ? '✅ PASS' : '⚠️  WARNING: Run tests twice to warm cache'}`);

  console.log('\n' + '='.repeat(80) + '\n');

  if (failed > 0) {
    console.log('❌ Some tests failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! Your API is ready for production.\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite error:', error);
  process.exit(1);
});
