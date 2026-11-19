#!/bin/bash
set -euo pipefail

VERSION=${1:-}

if [ -z "$VERSION" ]; then
  echo "Error: Version argument required"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORE_JS_DIR="$PROJECT_ROOT/sdk/core/js"
PACKAGE="@omnibase/core-js"
IMAGE="phoenixsolutionsgroup/omnibase-api"
GO_TAG="sdk/core/go/v$VERSION"

cd "$PROJECT_ROOT"

echo "========================================"
echo "Publishing API release v$VERSION"
echo "========================================"

dry_run() {
  jq --arg v "$VERSION" '.version = $v' "$CORE_JS_DIR/package.json" > "$CORE_JS_DIR/package.json.tmp"
  mv "$CORE_JS_DIR/package.json.tmp" "$CORE_JS_DIR/package.json"

  echo "DRY_RUN: validating npm publish of $PACKAGE@$VERSION"
  (cd "$CORE_JS_DIR" && npm publish --dry-run --access public)

  echo "DRY_RUN: validating docker build of $IMAGE:$VERSION"
  docker buildx build --call=check --file apps/api/Dockerfile .

  echo "DRY_RUN: skipping go tag, docker build and docker push"
}

npm_published() {
  npm view "$PACKAGE@$VERSION" version >/dev/null 2>&1
}

publish_npm() {
  jq --arg v "$VERSION" '.version = $v' "$CORE_JS_DIR/package.json" > "$CORE_JS_DIR/package.json.tmp"
  mv "$CORE_JS_DIR/package.json.tmp" "$CORE_JS_DIR/package.json"

  if npm_published; then
    echo "$PACKAGE@$VERSION already exists on npm, skipping"
    return
  fi

  echo "Publishing $PACKAGE@$VERSION to npm..."
  local log status
  log=$(mktemp)

  set +e
  (cd "$CORE_JS_DIR" && npm publish --access public) 2>&1 | tee "$log"
  status=${PIPESTATUS[0]}
  set -e

  if [ "$status" -eq 0 ]; then
    rm -f "$log"
    echo "Published $PACKAGE@$VERSION"
    return
  fi

  if npm_published; then
    rm -f "$log"
    echo "$PACKAGE@$VERSION is on npm despite the reported error, continuing"
    return
  fi

  if grep -q "TLOG_CREATE_ENTRY_ERROR" "$log"; then
    echo "Transparency log already has an entry for $PACKAGE@$VERSION, retrying without provenance"
    rm -f "$log"
    (cd "$CORE_JS_DIR" && npm publish --access public --provenance=false)
    echo "Published $PACKAGE@$VERSION without provenance"
    return
  fi

  rm -f "$log"
  echo "Error: failed to publish $PACKAGE@$VERSION" >&2
  exit 1
}

publish_go_tag() {
  echo "Tagging Go SDK with $GO_TAG..."
  if git ls-remote --exit-code --tags origin "refs/tags/$GO_TAG" >/dev/null 2>&1; then
    echo "Tag $GO_TAG already exists on origin, skipping"
    return
  fi

  if ! git rev-parse -q --verify "refs/tags/$GO_TAG" >/dev/null; then
    git tag "$GO_TAG"
  fi
  git push origin "$GO_TAG"
}

publish_docker() {
  echo "Building Docker image $IMAGE:$VERSION..."
  if docker manifest inspect "$IMAGE:$VERSION" >/dev/null 2>&1; then
    echo "Image $IMAGE:$VERSION already exists, skipping"
    return
  fi

  docker build \
    -f apps/api/Dockerfile \
    -t "$IMAGE:$VERSION" \
    -t "$IMAGE:latest" \
    --build-arg VERSION="$VERSION" \
    .

  echo "Pushing Docker image..."
  docker push "$IMAGE:$VERSION"
  docker push "$IMAGE:latest"
}

if [ "${DRY_RUN:-0}" = "1" ]; then
  dry_run
  exit 0
fi

publish_npm
publish_go_tag
publish_docker

echo "========================================"
echo "Publish complete!"
echo "========================================"
echo ""
echo "Published:"
echo "  - npm: $PACKAGE@$VERSION"
echo "  - Go:  github.com/phoenixsolutionsgroup/omnibase/sdk/core/go@v$VERSION"
echo "  - Docker: $IMAGE:$VERSION"
