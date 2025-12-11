#!/bin/bash

# API Testing Script for Signal Works LMS
# Usage: ./test-api.sh [SESSION_TOKEN]
#
# To get your session token:
# 1. Open browser DevTools (F12)
# 2. Go to Application → Cookies → localhost:3000
# 3. Copy the value of __session cookie
# 4. Run: ./test-api.sh "your_session_token_here"

SESSION_TOKEN="${1}"

if [ -z "$SESSION_TOKEN" ]; then
  echo "❌ Error: No session token provided"
  echo ""
  echo "Usage: ./test-api.sh YOUR_SESSION_TOKEN"
  echo ""
  echo "To get your session token:"
  echo "  1. Sign in to http://localhost:3000"
  echo "  2. Open DevTools (F12)"
  echo "  3. Go to Application → Cookies → localhost:3000"
  echo "  4. Copy the __session cookie value"
  echo ""
  exit 1
fi

BASE_URL="http://localhost:3000"

echo "🧪 Testing Signal Works LMS API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: List Users
echo "📋 Test 1: GET /api/admin/users"
curl -X GET "$BASE_URL/api/admin/users?limit=5" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION_TOKEN" \
  -s | jq '.' || echo "Failed or invalid JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: List Courses
echo "📚 Test 2: GET /api/admin/courses"
curl -X GET "$BASE_URL/api/admin/courses?limit=5" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION_TOKEN" \
  -s | jq '.' || echo "Failed or invalid JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: List Lessons
echo "📖 Test 3: GET /api/admin/lessons"
curl -X GET "$BASE_URL/api/admin/lessons?limit=5" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION_TOKEN" \
  -s | jq '.' || echo "Failed or invalid JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: Get Engagement
echo "📊 Test 4: GET /api/admin/engagement"
curl -X GET "$BASE_URL/api/admin/engagement" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION_TOKEN" \
  -s | jq '.' || echo "Failed or invalid JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: List Roadmaps
echo "🗺️  Test 5: GET /api/admin/roadmaps"
curl -X GET "$BASE_URL/api/admin/roadmaps?limit=5" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION_TOKEN" \
  -s | jq '.' || echo "Failed or invalid JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ All tests completed!"
