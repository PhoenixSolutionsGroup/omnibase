#!/bin/bash
set -e

echo "🚀 Publishing Omnibase Core SDKs..."
echo ""

# Get the version from openapi.yaml
VERSION=$(grep '^\s*version:' ../../apps/api/docs/openapi.yaml | head -1 | sed 's/.*version: *//' | tr -d '"' | tr -d "'")
echo "📦 Publishing version: $VERSION"
echo ""

# Publish JavaScript/TypeScript SDK
echo "📝 Publishing @omnibase/core-js to npm..."
cd js
npm publish --access public
cd ..
echo "✅ JavaScript SDK published!"
echo ""

# Publish Go SDK via Git tag
echo "📝 Publishing Go SDK via Git tag..."
cd go
# Check if tag already exists
if git rev-parse "sdk/core/go/v$VERSION" >/dev/null 2>&1; then
  echo "⚠️  Tag sdk/core/go/v$VERSION already exists. Skipping Go SDK tagging."
else
  git add .
  git commit -m "Release Go SDK v$VERSION" || echo "No changes to commit"
  git tag "sdk/core/go/v$VERSION"
  git push origin "sdk/core/go/v$VERSION"
  echo "✅ Go SDK tagged and pushed!"
fi
cd ..
echo ""

echo "🎉 All Core SDKs published successfully!"
echo ""
echo "Usage instructions:"
echo "  - JavaScript: npm install @omnibase/core-js@$VERSION"
echo "  - Go: go get github.com/phoenixsolutionsgroup/omnibase/sdk/core/go@v$VERSION"