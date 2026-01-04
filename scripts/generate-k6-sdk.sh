#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

echo -e "${BLUE}=== k6 SDK Generation ===${NC}"
echo ""

# Step 1: Bundle OpenAPI spec
echo -e "${BLUE}[1/2] Bundling OpenAPI specification...${NC}"
"$SCRIPT_DIR/bundle-openapi.sh"
echo -e "${GREEN}✓ OpenAPI spec bundled${NC}"

# Step 2: Generate k6 SDK
echo ""
echo -e "${BLUE}[2/2] Generating k6 SDK...${NC}"
openapi-to-k6 ./apps/api/docs/openapi.yaml ./tests/api/k6/sdk.ts
echo -e "${GREEN}✓ k6 SDK generated at tests/api/k6/sdk.ts${NC}"

echo ""
echo -e "${GREEN}k6 SDK generation complete!${NC}"
