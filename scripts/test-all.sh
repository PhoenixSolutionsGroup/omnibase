#!/bin/bash
set -uo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Track each group's exit code by name.
declare -A PIDS
declare -A EXITS

run_group() {
  # run_group <name> <command...>
  local name="$1"; shift
  echo -e "${BLUE}▶ starting:${NC} $name"
  ( "$@" ) > "/tmp/omnibase-test-$name.log" 2>&1 &
  PIDS[$name]=$!
}

# --- JS / TS workspaces ---------------------------------------------------
# bun --filter runs the `test` script in every workspace pkg that defines one,
# in parallel, and skips pkgs without it. New JS apps are picked up
# automatically once they declare a `test` script + sit in a workspace glob.
run_group "js" bun run --filter='*' test

# --- Go backends ----------------------------------------------------------
# TODO: enable when go tests are sorted out. Each go module runs `go test ./...`.
# Currently apps/api/tests/integration needs a live server (returns 405 offline).
# GO_DIRS=(
#   "apps/api"
# )
# go_all() {
#   local rc=0
#   for dir in "${GO_DIRS[@]}"; do
#     if [ -f "$ROOT_DIR/$dir/go.mod" ]; then
#       echo "── go test: $dir"
#       # exclude /tests/ (integration; needs live server) — unit tests only
#       ( cd "$ROOT_DIR/$dir" && go test $(go list ./... | grep -v '/tests/') ) || rc=1
#     else
#       echo "── skip (no go.mod): $dir"
#     fi
#   done
#   return $rc
# }
# run_group "go" go_all

# --- Wait + collect -------------------------------------------------------
for name in "${!PIDS[@]}"; do
  wait "${PIDS[$name]}"
  EXITS[$name]=$?
done

echo ""
echo -e "${BLUE}═══ results ═══${NC}"
FAILED=0
for name in "${!EXITS[@]}"; do
  cat "/tmp/omnibase-test-$name.log"
  if [ "${EXITS[$name]}" -eq 0 ]; then
    echo -e "${GREEN}✔ $name passed${NC}"
  else
    echo -e "${RED}✗ $name failed (exit ${EXITS[$name]})${NC}"
    FAILED=1
  fi
done

exit $FAILED
