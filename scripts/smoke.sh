#!/usr/bin/env bash
# Phase 12 — smoke test against a running stack
# Usage: BASE_URL=http://localhost:5000 ./scripts/smoke.sh
set -euo pipefail
BASE="${BASE_URL:-http://localhost:5000}"

echo "== health =="
curl -sf "$BASE/api/health" | head -c 200
echo

echo "== ready =="
curl -sf "$BASE/api/ready" | head -c 200 || echo "(ready may 503 if redis optional)"
echo

echo "== register (may 409 if exists) =="
EMAIL="smoke-$(date +%s)@example.com"
PASS="SmokeTest1234!"
curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | head -c 300
echo

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
echo "$LOGIN" | head -c 300
echo
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then
  echo "WARN: no token in login response – adjust path for your API shape"
fi

echo "== scan / verdict (adjust path to your scan endpoint) =="
# curl -sf -X POST "$BASE/api/safety/check" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"barcode":"4567890123456"}' || true

echo "Smoke finished. Exit 0 means health at least responded."
