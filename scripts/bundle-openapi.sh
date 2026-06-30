#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

OUT="$ROOT_DIR/apps/api/docs/openapi.json"

cd "$ROOT_DIR/apps/api"
KEEP_STACK=1 \
GIN_MODE=release \
LOG_LEVEL=ERROR \
API_VERSION="${API_VERSION:-local}" \
OPENAPI_DUMP_PATH="$OUT" \
  go test -count=1 -timeout 5m -run '^TestDumpOpenAPI$' ./tests/testenv/...

echo "✓ OpenAPI spec written to apps/api/docs/openapi.json (API_VERSION=${API_VERSION:-local})"
