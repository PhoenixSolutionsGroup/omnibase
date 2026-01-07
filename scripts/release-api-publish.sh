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
echo "Publishing API release v$VERSION"
echo "========================================"

# Publish JavaScript SDK to npm
echo "Publishing @omnibase/core-js@$VERSION to npm..."
cd sdk/core/js
npm publish --access public
cd "$PROJECT_ROOT"

# Push release commit (includes SDK changes) to main before tagging
echo "Pushing release commit to main..."
git push origin main

# Tag and push Go SDK
echo "Tagging Go SDK with sdk/core/go/v$VERSION..."
if git rev-parse "sdk/core/go/v$VERSION" >/dev/null 2>&1; then
  echo "Tag sdk/core/go/v$VERSION already exists, skipping"
else
  git tag "sdk/core/go/v$VERSION"
  git push origin "sdk/core/go/v$VERSION"
fi

# Build Docker image
echo "Building Docker image phoenixsolutionsgroup/omnibase-api:$VERSION..."
cd apps/api
docker build \
  -t phoenixsolutionsgroup/omnibase-api:$VERSION \
  -t phoenixsolutionsgroup/omnibase-api:latest \
  --build-arg VERSION=$VERSION \
  .

# Push Docker image
echo "Pushing Docker image..."
docker push phoenixsolutionsgroup/omnibase-api:$VERSION
docker push phoenixsolutionsgroup/omnibase-api:latest
cd "$PROJECT_ROOT"

echo "========================================"
echo "Publish complete!"
echo "========================================"
echo ""
echo "Published:"
echo "  - npm: @omnibase/core-js@$VERSION"
echo "  - Go:  github.com/phoenixsolutionsgroup/omnibase/sdk/core/go@v$VERSION"
echo "  - Docker: phoenixsolutionsgroup/omnibase-api:$VERSION"
