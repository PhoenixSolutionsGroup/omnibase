#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPORT_DIR="test-reports"

echo -e "${BLUE}=== API Test Results ===${NC}"
echo ""

if [ ! -d "$REPORT_DIR" ]; then
  echo -e "${YELLOW}No test reports found. Run 'bun run test:api:spec' first.${NC}"
  exit 0
fi

# Find latest JUnit report
LATEST_JUNIT=$(ls -t ${REPORT_DIR}/junit-*.xml 2>/dev/null | head -1)
LATEST_HAR=$(ls -t ${REPORT_DIR}/har-*.json 2>/dev/null | head -1)

if [ -z "$LATEST_JUNIT" ]; then
  echo -e "${YELLOW}No test reports found.${NC}"
  exit 0
fi

echo -e "${GREEN}Latest Test Results:${NC}"
echo -e "  JUnit Report: $(basename $LATEST_JUNIT)"
echo -e "  HAR Archive:  $(basename $LATEST_HAR)"
echo ""

# Parse JUnit XML for summary
if command -v xmllint &> /dev/null; then
  echo -e "${BLUE}Test Summary:${NC}"
  
  TESTS=$(xmllint --xpath "string(/testsuites/@tests)" "$LATEST_JUNIT" 2>/dev/null)
  FAILURES=$(xmllint --xpath "string(/testsuites/@failures)" "$LATEST_JUNIT" 2>/dev/null)
  ERRORS=$(xmllint --xpath "string(/testsuites/@errors)" "$LATEST_JUNIT" 2>/dev/null)
  SKIPPED=$(xmllint --xpath "string(/testsuites/@skipped)" "$LATEST_JUNIT" 2>/dev/null)
  TIME=$(xmllint --xpath "string(/testsuites/@time)" "$LATEST_JUNIT" 2>/dev/null)
  
  if [ -n "$TESTS" ]; then
    PASSED=$((TESTS - FAILURES - ERRORS - SKIPPED))
    echo -e "  Total:    ${TESTS} tests"
    echo -e "  ${GREEN}✓ Passed:  ${PASSED}${NC}"
    [ "$FAILURES" -gt 0 ] && echo -e "  ${YELLOW}✗ Failed:  ${FAILURES}${NC}"
    [ "$ERRORS" -gt 0 ] && echo -e "  ${YELLOW}⚠ Errors:  ${ERRORS}${NC}"
    [ "$SKIPPED" -gt 0 ] && echo -e "  ⏭ Skipped: ${SKIPPED}"
    echo -e "  Time:     ${TIME}s"
  fi
else
  echo -e "${YELLOW}Install xmllint for detailed summary${NC}"
fi

echo ""
echo -e "${BLUE}View Reports:${NC}"
echo -e "  JUnit XML:  cat ${LATEST_JUNIT}"
echo -e "  HAR File:   cat ${LATEST_HAR}"
echo ""
echo -e "${BLUE}Quick Stats:${NC}"
echo -e "  Report size: $(du -h ${LATEST_JUNIT} | cut -f1)"
echo -e "  HAR size:    $(du -h ${LATEST_HAR} | cut -f1)"
echo ""

# Show failed tests if any
if [ -s "$LATEST_JUNIT" ] && command -v xmllint &> /dev/null; then
  FAILED_COUNT=$(xmllint --xpath "count(//testcase[failure])" "$LATEST_JUNIT" 2>/dev/null)
  
  if [ "$FAILED_COUNT" -gt 0 ] && [ "$FAILED_COUNT" -le 10 ]; then
    echo -e "${YELLOW}Failed Tests:${NC}"
    xmllint --xpath "//testcase[failure]/@name" "$LATEST_JUNIT" 2>/dev/null | \
      sed 's/name="/ - /g' | sed 's/"//g'
    echo ""
  elif [ "$FAILED_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}${FAILED_COUNT} tests failed (showing first 10):${NC}"
    xmllint --xpath "//testcase[failure]/@name" "$LATEST_JUNIT" 2>/dev/null | \
      sed 's/name="/ - /g' | sed 's/"//g' | head -10
    echo ""
  fi
fi

echo -e "${BLUE}All Reports:${NC}"
ls -lh ${REPORT_DIR}/*.xml ${REPORT_DIR}/*.json 2>/dev/null | awk '{print "  " $9 "  (" $5 ")"}'
echo ""
