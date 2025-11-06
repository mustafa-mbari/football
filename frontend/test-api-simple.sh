#!/bin/bash

# Simple API Testing Script
# Run with: bash frontend/test-api-simple.sh

API_BASE="${NEXT_PUBLIC_APP_URL:-http://localhost:8080}"

echo "🧪 Testing API Routes..."
echo "📡 API Base: $API_BASE"
echo ""
echo "=================================================="

test_endpoint() {
  local endpoint=$1
  local expected_status=${2:-200}

  echo -n "Testing $endpoint... "

  start=$(date +%s%3N)
  status=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint")
  end=$(date +%s%3N)
  time=$((end - start))

  if [ "$status" -eq "$expected_status" ]; then
    echo "✅ PASS (${time}ms, Status: $status)"
  else
    echo "❌ FAIL (${time}ms, Expected: $expected_status, Got: $status)"
  fi
}

echo ""
echo "🌍 Edge Runtime Tests (Should be < 150ms)"
echo "--------------------------------------------------"
test_endpoint "/api/leagues"
test_endpoint "/api/teams"
test_endpoint "/api/teams?leagueId=1"
test_endpoint "/api/matches"
test_endpoint "/api/matches?leagueId=1&limit=10"
test_endpoint "/api/leaderboard"
test_endpoint "/api/standings?leagueId=1"
test_endpoint "/api/gameweeks?leagueId=1"

echo ""
echo "🖥️  Node Runtime Tests (Auth Required)"
echo "--------------------------------------------------"
test_endpoint "/api/auth/me" 401
test_endpoint "/api/predictions" 401
test_endpoint "/api/groups" 401

echo ""
echo "=================================================="
echo "✅ Basic API tests complete!"
echo ""
echo "For detailed testing with auth, use:"
echo "  npx tsx frontend/test-api.ts"
