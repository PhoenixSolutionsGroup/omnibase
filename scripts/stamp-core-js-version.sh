#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
CORE_JS_DIR="$ROOT/sdk/core/js"

VERSION="${CORE_JS_VERSION:-}"
if [ -z "$VERSION" ] || [ "$VERSION" = "0.0.0-dev" ]; then
  VERSION=$(npm view @omnibase/core-js version)
fi

if [ -z "$VERSION" ] || [ "$VERSION" = "0.0.0-dev" ]; then
  echo "Error: could not resolve a published @omnibase/core-js version"
  exit 1
fi

jq --arg v "$VERSION" '.version = $v' "$CORE_JS_DIR/package.json" > "$CORE_JS_DIR/package.json.tmp"
mv "$CORE_JS_DIR/package.json.tmp" "$CORE_JS_DIR/package.json"

cd "$ROOT" && bun install --ignore-scripts

echo "Stamped @omnibase/core-js workspace version to $VERSION"
