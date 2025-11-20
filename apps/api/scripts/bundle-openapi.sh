#!/bin/bash
set -e

echo "📦 Bundling OpenAPI specifications..."
echo ""

# Navigate to the API directory
cd "$(dirname "$0")/.."

echo "✓ Working directory: $(pwd)"
echo ""

echo "📥 Installing Redocly CLI..."
npm install
echo ""

echo "🔍 Validating OpenAPI specs..."
npm run openapi:lint
echo ""

echo "🔧 Bundling OpenAPI specs..."
npm run openapi:bundle
echo ""

echo "✅ Validating bundled spec..."
npx redocly lint docs/openapi-bundled.yaml
echo ""

echo "📊 Bundle statistics:"
echo "  - Source file: docs/openapi.yaml"
echo "  - Output file: docs/openapi-bundled.yaml"
echo "  - File size: $(du -h docs/openapi-bundled.yaml | cut -f1)"
echo "  - Endpoints: $(grep -c 'operationId:' docs/openapi-bundled.yaml || echo '0')"
echo ""

echo "✅ OpenAPI bundle complete: apps/api/docs/openapi-bundled.yaml"