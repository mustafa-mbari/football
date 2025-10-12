import { PointsCalculator } from '../src/utils/PointsCalculator';

console.log('🧪 Testing Points Calculator\n');
console.log('═'.repeat(60));

interface TestCase {
  name: string;
  predicted: { home: number; away: number };
  actual: { home: number; away: number };
  expectedPoints: number;
}

const testCases: TestCase[] = [
  {
    name: 'Exact Score (2-1)',
    predicted: { home: 2, away: 1 },
    actual: { home: 2, away: 1 },
    expectedPoints: 10, // 1+1+3+2+3 = All rules matched
  },
  {
    name: 'Correct Result Only (2-1 vs 1-0)',
    predicted: { home: 2, away: 1 },
    actual: { home: 1, away: 0 },
    expectedPoints: 3, // 0+0+3+0+0 = Result only (both are home wins, different totals)
  },
  {
    name: 'Correct Result + Total Goals (2-1 vs 3-0)',
    predicted: { home: 2, away: 1 },
    actual: { home: 3, away: 0 },
    expectedPoints: 5, // 0+0+3+2+0 = Result + Total (both home wins with 3 goals)
  },
  {
    name: 'Exact Home Score (2-1 vs 2-0)',
    predicted: { home: 2, away: 1 },
    actual: { home: 2, away: 0 },
    expectedPoints: 4, // 1+0+3+0+0 = Home + Result
  },
  {
    name: 'Exact Away Score (2-1 vs 0-1)',
    predicted: { home: 2, away: 1 },
    actual: { home: 0, away: 1 },
    expectedPoints: 1, // 0+1+0+0+0 = Away only
  },
  {
    name: 'Total Goals Only (2-1 vs 1-2)',
    predicted: { home: 2, away: 1 },
    actual: { home: 1, away: 2 },
    expectedPoints: 2, // 0+0+0+2+0 = Total only
  },
  {
    name: 'Total Goals Match (2-1 vs 0-3)',
    predicted: { home: 2, away: 1 },
    actual: { home: 0, away: 3 },
    expectedPoints: 2, // 0+0+0+2+0 = Total goals only (both sum to 3)
  },
  {
    name: 'Draw Exact Score (1-1)',
    predicted: { home: 1, away: 1 },
    actual: { home: 1, away: 1 },
    expectedPoints: 10, // 1+1+3+2+3 = All rules matched
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const breakdown = PointsCalculator.calculatePointsBreakdown({
    predictedHomeScore: testCase.predicted.home,
    predictedAwayScore: testCase.predicted.away,
    actualHomeScore: testCase.actual.home,
    actualAwayScore: testCase.actual.away,
  });

  const status = breakdown.total === testCase.expectedPoints ? '✅ PASS' : '❌ FAIL';
  if (breakdown.total === testCase.expectedPoints) {
    passed++;
  } else {
    failed++;
  }

  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`   Predicted: ${testCase.predicted.home}-${testCase.predicted.away}`);
  console.log(`   Actual: ${testCase.actual.home}-${testCase.actual.away}`);
  console.log(`   ${status}`);
  console.log(`   Expected: ${testCase.expectedPoints} | Got: ${breakdown.total}`);
  console.log(`   Breakdown:`);
  console.log(`     - Exact Home: ${breakdown.exactHomeScore}`);
  console.log(`     - Exact Away: ${breakdown.exactAwayScore}`);
  console.log(`     - Correct Result: ${breakdown.correctResult}`);
  console.log(`     - Correct Total: ${breakdown.correctTotalGoals}`);
  console.log(`     - Exact Bonus: ${breakdown.exactScoreBonus}`);
});

console.log('\n' + '═'.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
