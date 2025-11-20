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
TEST_ENV_FILE=".test-env"

echo -e "${BLUE}=== Omni-Base API Test Environment Cleanup ===${NC}"
echo ""

# Check if test environment file exists
if [ ! -f "$TEST_ENV_FILE" ]; then
  echo -e "${YELLOW}No test environment found (${TEST_ENV_FILE} doesn't exist)${NC}"
  echo -e "${YELLOW}Nothing to clean up.${NC}"
  exit 0
fi

# Load environment variables
source "$TEST_ENV_FILE"

if [ -z "$TEST_USER_ID" ] || [ -z "$TEST_TENANT_ID" ]; then
  echo -e "${RED}✗ Invalid test environment file${NC}"
  echo -e "${YELLOW}Required variables TEST_USER_ID and TEST_TENANT_ID not found${NC}"
  exit 1
fi

echo -e "${BLUE}Cleaning up test resources...${NC}"
echo -e "  User ID:    ${TEST_USER_ID}"
echo -e "  Tenant ID:  ${TEST_TENANT_ID}"
echo ""

# Step 1: Delete Tenant
echo -e "${BLUE}[1/3] Deleting tenant...${NC}"

DELETE_TENANT_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "${API_BASE_URL}/api/v1/tenants/${TEST_TENANT_ID}" \
  -H "X-Service-Key: ${TEST_SERVICE_KEY}")

HTTP_CODE=$(echo "$DELETE_TENANT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ Tenant deleted (HTTP ${HTTP_CODE})${NC}"
else
  echo -e "${YELLOW}⚠ Tenant deletion returned HTTP ${HTTP_CODE}${NC}"
  echo "Response: $(echo "$DELETE_TENANT_RESPONSE" | head -n -1)"
fi

# Step 2: Delete Kratos Identity
echo -e "${BLUE}[2/3] Deleting Kratos identity...${NC}"

DELETE_IDENTITY_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "${KRATOS_ADMIN_URL}/admin/identities/${TEST_USER_ID}")

HTTP_CODE=$(echo "$DELETE_IDENTITY_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ Identity deleted (HTTP ${HTTP_CODE})${NC}"
else
  echo -e "${YELLOW}⚠ Identity deletion returned HTTP ${HTTP_CODE}${NC}"
  echo "Response: $(echo "$DELETE_IDENTITY_RESPONSE" | head -n -1)"
fi

# Step 3: Remove test environment file
echo -e "${BLUE}[3/3] Removing test environment file...${NC}"
rm -f "$TEST_ENV_FILE"
echo -e "${GREEN}✓ Test environment file removed${NC}"

echo ""
echo -e "${GREEN}Cleanup Complete!${NC}"
echo ""
