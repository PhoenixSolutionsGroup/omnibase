#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
KRATOS_ADMIN_URL="${KRATOS_ADMIN_URL:-http://localhost:4434}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8080}"
SERVICE_KEY="${SERVICE_KEY:-VERY_SECRET_KEY}"
TEST_ENV_FILE=".test-env"

echo -e "${BLUE}=== Omni-Base API Test Environment Setup ===${NC}"
echo ""

# Step 1: Create Kratos Identity
echo -e "${BLUE}[1/4] Creating Kratos identity...${NC}"

# Use timestamp to ensure unique email for each test run
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-api-${TIMESTAMP}@schemathesis.local"

IDENTITY_RESPONSE=$(curl -s -X POST "${KRATOS_ADMIN_URL}/admin/identities" \
  -H "Content-Type: application/json" \
  -d "{
    \"schema_id\": \"default\",
    \"traits\": {
      \"email\": \"${TEST_EMAIL}\",
      \"name\": {
        \"first\": \"API\",
        \"last\": \"Test\"
      }
    },
    \"credentials\": {
      \"password\": {
        \"config\": {
          \"password\": \"test-password-123\"
        }
      }
    }
  }")

# Check if identity creation was successful
if echo "$IDENTITY_RESPONSE" | grep -q '"id"'; then
  USER_ID=$(echo "$IDENTITY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ Identity created: ${USER_ID}${NC}"
else
  echo -e "${RED}✗ Failed to create identity${NC}"
  echo "Response: $IDENTITY_RESPONSE"
  exit 1
fi

# Step 2: Create Tenant
echo -e "${BLUE}[2/4] Creating tenant...${NC}"

TENANT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/tenants" \
  -H "Content-Type: application/json" \
  -H "X-Service-Key: ${SERVICE_KEY}" \
  -H "X-User-ID: ${USER_ID}" \
  -d "{
    \"name\": \"Schemathesis Test Org\",
    \"billing_email\": \"billing-test@schemathesis.local\"
  }")

# Check if tenant creation was successful
if echo "$TENANT_RESPONSE" | grep -q '"tenant"'; then
  TENANT_ID=$(echo "$TENANT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}✓ Tenant created: ${TENANT_ID}${NC}"
else
  echo -e "${RED}✗ Failed to create tenant${NC}"
  echo "Response: $TENANT_RESPONSE"
  
  # Cleanup the identity if tenant creation failed
  echo -e "${YELLOW}Cleaning up identity...${NC}"
  curl -s -X DELETE "${KRATOS_ADMIN_URL}/admin/identities/${USER_ID}" > /dev/null
  exit 1
fi

# Step 3: Save environment variables
echo -e "${BLUE}[3/4] Saving test environment variables...${NC}"

cat > "$TEST_ENV_FILE" << EOF
# Auto-generated test environment variables
# Created: $(date)
export TEST_USER_ID="${USER_ID}"
export TEST_TENANT_ID="${TENANT_ID}"
export TEST_SERVICE_KEY="${SERVICE_KEY}"
export TEST_API_URL="${API_BASE_URL}"
export TEST_KRATOS_ADMIN_URL="${KRATOS_ADMIN_URL}"
EOF

echo -e "${GREEN}✓ Environment variables saved to ${TEST_ENV_FILE}${NC}"

# Step 4: Display summary
echo ""
echo -e "${BLUE}[4/4] Setup Complete!${NC}"
echo ""
echo -e "${GREEN}Test Environment Details:${NC}"
echo -e "  User ID:      ${USER_ID}"
echo -e "  Tenant ID:    ${TENANT_ID}"
echo -e "  Service Key:  ${SERVICE_KEY}"
echo -e "  API URL:      ${API_BASE_URL}"
echo ""
echo -e "${YELLOW}To use these variables in your shell:${NC}"
echo -e "  ${BLUE}source ${TEST_ENV_FILE}${NC}"
echo ""
echo -e "${YELLOW}To run schemathesis tests:${NC}"
echo -e "  ${BLUE}bun run test:api:spec${NC}"
echo ""
echo -e "${YELLOW}To cleanup the test environment:${NC}"
echo -e "  ${BLUE}bun run test:api:cleanup${NC}"
echo ""
