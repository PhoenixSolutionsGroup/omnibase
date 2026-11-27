#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

OUT="$ROOT_DIR/apps/api/docs/openapi.json"

if [ -z "${API_VERSION:-}" ] && [ -n "${GITHUB_ACTIONS:-}" ]; then
  LATEST_TAG=$(git describe --tags --match "api-v*" --abbrev=0 2>/dev/null || true)
  API_VERSION="${LATEST_TAG#api-v}"
fi

if [ -z "${API_VERSION:-}" ] && [ -f "$OUT" ]; then
  API_VERSION=$(jq -r '.info.version // empty' "$OUT" 2>/dev/null || true)
fi

if [ -z "${API_VERSION:-}" ]; then
  echo "Error: API_VERSION is not set and apps/api/docs/openapi.json has no info.version" >&2
  exit 1
fi

cd "$ROOT_DIR/apps/api"
GIN_MODE=release \
LOG_LEVEL=ERROR \
API_VERSION="$API_VERSION" \
  go run ./cmd/openapi "$OUT"

echo "✓ OpenAPI spec written to apps/api/docs/openapi.json (API_VERSION=$API_VERSION)"

cd "$ROOT_DIR"
bun scripts/openapi-to-jsonschema.ts
