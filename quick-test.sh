#!/bin/bash

# Quick test script - replace YOUR_SESSION_TOKEN with the actual token
# Usage: ./quick-test.sh "your_session_token_here"

if [ -z "$1" ]; then
  echo "❌ Usage: ./quick-test.sh YOUR_SESSION_TOKEN"
  echo ""
  echo "To get your session token:"
  echo "  1. Sign in at http://localhost:3000"
  echo "  2. Open DevTools (F12) → Application tab"
  echo "  3. Cookies → localhost:3000"
  echo "  4. Copy the __session cookie value"
  exit 1
fi

SESSION="$1"

echo "🧪 Testing with session token..."
echo "Token preview: ${SESSION:0:20}..."
echo ""

echo "📋 Testing GET /api/admin/users..."
curl -X GET "http://localhost:3000/api/admin/users?limit=3" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$SESSION" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq '.' 2>/dev/null || cat

echo ""
echo "Done!"
