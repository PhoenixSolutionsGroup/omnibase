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

# Update OpenAPI version in info.yaml
echo "Updating info.yaml version to $VERSION..."
sed -i "s/^\(  version: \).*/\1$VERSION/" apps/api/docs/info.yaml

# Bundle OpenAPI spec
echo "Bundling OpenAPI spec..."
./scripts/bundle-openapi.sh

# Generate SDKs from OpenAPI
echo "Generating SDKs..."
./scripts/generate-sdk.sh

# Update JS SDK package.json version
echo "Updating @omnibase/core-js version to $VERSION..."
jq --arg v "$VERSION" '.version = $v' sdk/core/js/package.json > sdk/core/js/package.json.tmp && mv sdk/core/js/package.json.tmp sdk/core/js/package.json

# Stage SDK files for semantic-release/git to commit
# Note: glob patterns with ../../ don't work in @semantic-release/git,
# so we stage these files explicitly here
echo "Staging SDK files for commit..."
git add sdk/core/

echo "========================================"
echo "Prepare complete!"
echo "========================================"
