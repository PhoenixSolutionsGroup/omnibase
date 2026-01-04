#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Parse arguments
GENERATE_JS=true
GENERATE_GO=true
SKIP_CLEAN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --js-only)
      GENERATE_GO=false
      shift
      ;;
    --go-only)
      GENERATE_JS=false
      shift
      ;;
    --skip-clean)
      SKIP_CLEAN=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Generates SDKs from the OpenAPI specification."
      echo ""
      echo "Options:"
      echo "  --js-only     Only generate JavaScript/TypeScript SDK"
      echo "  --go-only     Only generate Go SDK"
      echo "  --skip-clean  Don't clean existing SDK files before generating"
      echo "  --help        Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}=== SDK Generation ===${NC}"
echo ""

# Step 1: Bundle OpenAPI spec
echo -e "${BLUE}[1/3] Bundling OpenAPI specification...${NC}"
"$SCRIPT_DIR/bundle-openapi.sh"
echo -e "${GREEN}✓ OpenAPI spec bundled${NC}"

# Step 2: Clean existing SDK files
if [ "$SKIP_CLEAN" = false ]; then
  echo ""
  echo -e "${BLUE}[2/3] Cleaning existing SDK files...${NC}"

  if [ "$GENERATE_JS" = true ]; then
    rm -rf sdk/core/js/src sdk/core/js/*.ts sdk/core/js/*.json sdk/core/js/*.md 2>/dev/null || true
    echo -e "${GREEN}✓ JS SDK cleaned${NC}"
  fi

  if [ "$GENERATE_GO" = true ]; then
    rm -rf sdk/core/go/*.go sdk/core/go/docs sdk/core/go/api sdk/core/go/test 2>/dev/null || true
    echo -e "${GREEN}✓ Go SDK cleaned${NC}"
  fi
else
  echo -e "${YELLOW}[2/3] Skipping clean${NC}"
fi

# Step 3: Generate SDKs
echo ""
echo -e "${BLUE}[3/3] Generating SDKs...${NC}"

if [ "$GENERATE_JS" = true ]; then
  echo -e "${BLUE}Generating JavaScript SDK...${NC}"
  cd apps/api
  npx openapi-generator-cli generate \
    -i docs/openapi.yaml \
    -g typescript-fetch \
    -o ../../sdk/core/js \
    --additional-properties=supportsES6=true,npmName=@omnibase/core-js
  cd "$ROOT_DIR"
  echo -e "${GREEN}✓ JavaScript SDK generated${NC}"
fi

if [ "$GENERATE_GO" = true ]; then
  echo -e "${BLUE}Generating Go SDK...${NC}"
  cd apps/api
  npx openapi-generator-cli generate \
    -i docs/openapi.yaml \
    -g go \
    -o ../../sdk/core/go \
    --additional-properties=packageName=omnibase \
    --git-user-id=phoenixsolutionsgroup \
    --git-repo-id=omnibase/sdk/core/go
  cd "$ROOT_DIR"
  echo -e "${GREEN}✓ Go SDK generated${NC}"
fi

echo ""
echo -e "${GREEN}SDK generation complete!${NC}"
