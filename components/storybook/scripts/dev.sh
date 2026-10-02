#!/usr/bin/env bash
set -euo pipefail

COMPONENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

export NODE_OPTIONS="${NODE_OPTIONS:+${NODE_OPTIONS} }--max-old-space-size=8192"

echo "Generating framework outputs from @omnibase/mitosis..."
(cd "$COMPONENTS_DIR/core" && bun run build)

pids=()
start() {
  local dir="$1"
  shift
  (cd "$dir" && exec "$@") &
  pids+=("$!")
}

cleanup() {
  trap - EXIT INT TERM
  for pid in "${pids[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait_for() {
  local url="$1" tries=0
  printf "  waiting for %s" "$url"
  until curl -sf -o /dev/null "$url"; do
    tries=$((tries + 1))
    if [ "$tries" -ge 240 ]; then
      printf " timed out\n"
      return 1
    fi
    sleep 0.5
    printf "."
  done
  printf " ready\n"
}

refs=(
  "React:6008:frameworks/react"
  "Vue:6009:frameworks/vue"
  "Svelte:6010:frameworks/svelte"
  "Preact:6011:frameworks/preact"
  "Solid:6012:frameworks/solid"
  "Angular:6013:frameworks/angular"
)

for ref in "${refs[@]}"; do
  IFS=: read -r name port dir <<< "$ref"
  printf "Starting %-7s Storybook -> http://localhost:%s\n" "$name" "$port"
  start "$COMPONENTS_DIR/$dir" bun run storybook:only
  wait_for "http://127.0.0.1:${port}/iframe.html"
done

echo "Starting host Storybook    -> http://localhost:6007"
start "$COMPONENTS_DIR/storybook" bun run storybook:only

wait
