#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load .env file from repo root if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

# Configuration from environment (export for k6 subprocess)
export API_URL="${API_URL:-http://localhost:8080}"
export SERVICE_KEY="${SERVICE_KEY:-VERY_SECRET_KEY}"

# Validate required env vars
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo -e "${RED}Error: STRIPE_SECRET_KEY is not set${NC}"
  echo ""
  echo "Set it via:"
  echo "  1. Create .env in repo root with: STRIPE_SECRET_KEY=sk_test_..."
  echo "  2. Or export it: export STRIPE_SECRET_KEY=sk_test_..."
  echo "  3. Or in GitHub Actions: set it as a repository secret"
  exit 1
fi
export STRIPE_SECRET_KEY

# Test state (populated by setup, used for contract tests only)
TEST_USER_ID=""
TEST_TENANT_ID=""

# Parse arguments
RUN_K6=true
RUN_CONTRACT=true
LOCAL_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --local)
      LOCAL_MODE=true
      shift
      ;;
    --k6-only)
      RUN_CONTRACT=false
      shift
      ;;
    --contract-only)
      RUN_K6=false
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --local          Run k6 locally (no cloud reporting)"
      echo "  --k6-only        Only run k6 integration tests"
      echo "  --contract-only  Only run schemathesis contract tests"
      echo "  --help           Show this help message"
      echo ""
      echo "Environment variables (set in .env or export):"
      echo "  API_URL            API base URL (default: http://localhost:8080)"
      echo "  SERVICE_KEY        Service authentication key (default: VERY_SECRET_KEY)"
      echo "  STRIPE_SECRET_KEY  Stripe test key (required)"
      echo ""
      echo "Create a .env file in the repo root with these variables."
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Cleanup function (runs on exit, only cleans up contract test resources)
cleanup() {
  if [ -n "$TEST_TENANT_ID" ] || [ -n "$TEST_USER_ID" ]; then
    echo ""
    echo -e "${BLUE}=== Cleanup ===${NC}"
  fi

  if [ -n "$TEST_TENANT_ID" ]; then
    echo -e "${BLUE}Deleting test tenant...${NC}"
    curl -sf -X DELETE "${API_URL}/api/v1/tenants/${TEST_TENANT_ID}" \
      -H "X-Service-Key: ${SERVICE_KEY}" > /dev/null 2>&1 || true
    echo -e "${GREEN}✓ Tenant deleted${NC}"
  fi

  if [ -n "$TEST_USER_ID" ]; then
    echo -e "${BLUE}Deleting test user...${NC}"
    curl -sf -X DELETE "${API_URL}/api/v1/auth/admin/proxy/admin/identities/${TEST_USER_ID}" \
      -H "X-Service-Key: ${SERVICE_KEY}" > /dev/null 2>&1 || true
    echo -e "${GREEN}✓ User deleted${NC}"
  fi
}

trap cleanup EXIT

echo -e "${BLUE}=== OmniBase API Tests ===${NC}"
echo -e "API URL: ${API_URL}"
echo ""

# Bundle OpenAPI spec to ensure we're testing against latest
echo -e "${BLUE}Bundling OpenAPI spec...${NC}"
"$SCRIPT_DIR/bundle-openapi.sh"
echo -e "${GREEN}✓ OpenAPI spec bundled${NC}"
echo ""

# Track test results
K6_EXIT_CODE=0
CONTRACT_EXIT_CODE=0

# Step 1: Run k6 integration tests (manages its own test data)
if [ "$RUN_K6" = true ]; then
  echo -e "${BLUE}[1/2] Running k6 integration tests...${NC}"

  # Generate k6 SDK from OpenAPI spec
  echo -e "${BLUE}Generating k6 SDK...${NC}"
  npx openapi-to-k6 ./apps/api/docs/openapi.yaml ./tests/api/k6/sdk.ts

  # Build k6 tests
  echo -e "${BLUE}Building k6 tests...${NC}"
  bun build ./tests/api/k6/index.ts --outdir ./tests/api/k6/dist --target=node --format=esm --external k6

  if [ "$LOCAL_MODE" = true ]; then
    k6 run ./tests/api/k6/dist/index.js || K6_EXIT_CODE=$?
  else
    k6 run --out cloud ./tests/api/k6/dist/index.js || K6_EXIT_CODE=$?
  fi

  if [ $K6_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ k6 tests passed${NC}"
  else
    echo -e "${RED}✗ k6 tests failed (exit code: $K6_EXIT_CODE)${NC}"
  fi
else
  echo -e "${YELLOW}[1/2] Skipping k6 tests${NC}"
fi

# Step 2: Run schemathesis contract tests (needs test user/tenant)
if [ "$RUN_CONTRACT" = true ]; then
  echo ""
  echo -e "${BLUE}[2/2] Running schemathesis contract tests...${NC}"

  # Create test user for contract tests
  echo -e "${BLUE}Creating test user...${NC}"
  TIMESTAMP=$(date +%s)
  TEST_EMAIL="test-contract-${TIMESTAMP}@test.local"

  USER_RESPONSE=$(curl -sf -X POST "${API_URL}/api/v1/auth/users" \
    -H "Content-Type: application/json" \
    -H "X-Service-Key: ${SERVICE_KEY}" \
    -d "{
      \"email\": \"${TEST_EMAIL}\",
      \"password\": \"test-password-123\",
      \"name\": {
        \"first\": \"Contract\",
        \"last\": \"Test\"
      }
    }")

  TEST_USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$TEST_USER_ID" ]; then
    echo -e "${RED}✗ Failed to create test user${NC}"
    echo "Response: $USER_RESPONSE"
    exit 1
  fi
  echo -e "${GREEN}✓ User created: ${TEST_USER_ID}${NC}"

  # Create test tenant for contract tests
  echo -e "${BLUE}Creating test tenant...${NC}"
  TENANT_RESPONSE=$(curl -sf -X POST "${API_URL}/api/v1/tenants" \
    -H "Content-Type: application/json" \
    -H "X-Service-Key: ${SERVICE_KEY}" \
    -H "X-User-ID: ${TEST_USER_ID}" \
    -d "{
      \"name\": \"Contract Test Org\",
      \"billing_email\": \"billing-${TIMESTAMP}@test.local\"
    }")

  TEST_TENANT_ID=$(echo "$TENANT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  STRIPE_CUSTOMER_ID=$(echo "$TENANT_RESPONSE" | grep -o '"stripe_customer_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$TEST_TENANT_ID" ]; then
    echo -e "${RED}✗ Failed to create test tenant${NC}"
    echo "Response: $TENANT_RESPONSE"
    exit 1
  fi
  echo -e "${GREEN}✓ Tenant created: ${TEST_TENANT_ID}${NC}"
  if [ -n "$STRIPE_CUSTOMER_ID" ]; then
    echo -e "${GREEN}✓ Stripe customer: ${STRIPE_CUSTOMER_ID}${NC}"
  fi

  # Run schemathesis (auto-discovers schemathesis.toml from tests/api/contract/)
  echo -e "${BLUE}Running schemathesis...${NC}"
  (cd tests/api/contract && schemathesis run ../../../apps/api/docs/openapi.yaml \
    --url "${API_URL}" \
    -H "X-Service-Key: ${SERVICE_KEY}" \
    -H "X-Tenant-ID: ${TEST_TENANT_ID}" \
    -H "X-User-ID: ${TEST_USER_ID}" \
    ${STRIPE_CUSTOMER_ID:+-H "X-Stripe-Customer-Id: ${STRIPE_CUSTOMER_ID}"}) \
    || CONTRACT_EXIT_CODE=$?

  if [ $CONTRACT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Contract tests passed${NC}"
  else
    echo -e "${RED}✗ Contract tests failed (exit code: $CONTRACT_EXIT_CODE)${NC}"
  fi
else
  echo -e "${YELLOW}[2/2] Skipping contract tests${NC}"
fi

echo ""
echo -e "${BLUE}=== Results ===${NC}"

if [ $K6_EXIT_CODE -eq 0 ] && [ $CONTRACT_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  [ $K6_EXIT_CODE -ne 0 ] && echo -e "${RED}k6 tests failed${NC}"
  [ $CONTRACT_EXIT_CODE -ne 0 ] && echo -e "${RED}Contract tests failed${NC}"
  exit 1
fi
