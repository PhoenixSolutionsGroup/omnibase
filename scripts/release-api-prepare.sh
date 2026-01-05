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
cd sdk/core/js
npm version $VERSION --no-git-tag-version --allow-same-version
cd "$PROJECT_ROOT"

echo "========================================"
echo "Prepare complete!"
echo "========================================"
