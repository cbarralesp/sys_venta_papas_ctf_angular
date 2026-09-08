#!/bin/sh
set -eu

API_BASE_URL="${API_BASE_URL:-http://localhost:8090/api}"
escaped_url="$(printf '%s' "$API_BASE_URL" | sed 's/[\\&|]/\\&/g')"
sed "s|__API_BASE_URL__|$escaped_url|g" \
  /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js
