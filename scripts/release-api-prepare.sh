#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version argument required"
  exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "========================================"
echo "Preparing API release v$VERSION"
echo "========================================"

# Regen SDKs with placeholder version. Real version is served at runtime
# from the API_VERSION env (Dockerfile), published to npm at publish time,
# and tagged for Go — never committed to git, so the committed source stays
# drift-check-stable between releases.
echo "Regenerating SDKs (placeholder version)..."
./scripts/generate-sdk.sh

# Stage SDK files + spec for semantic-release/git to commit
# Note: glob patterns with ../../ don't work in @semantic-release/git,
# so we stage these files explicitly here
echo "Staging SDK + spec for commit..."
git add -f sdk/core/ apps/api/docs/openapi.json

echo "========================================"
echo "Prepare complete!"
echo "========================================"
