#!/usr/bin/env bash
# Simple CORS test script: checks OPTIONS response headers for /rds
set -euo pipefail
API=${1:-http://localhost:8000}

echo "Testing CORS on $API/rds"

hdrs=$(curl -s -X OPTIONS -D - "$API/rds" -o /dev/null)

echo "$hdrs" | grep -i "Access-Control-Allow-Origin" >/dev/null && echo "CORS header present" || (echo "CORS header missing" && exit 2)

echo "OK"
