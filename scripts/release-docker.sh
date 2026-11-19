#!/bin/bash
set -euo pipefail

VERSION=${1:-}

if [ -z "$VERSION" ]; then
  echo "Error: Version argument required"
  exit 1
fi

if [ -z "${DOCKER_IMAGE:-}" ]; then
  echo "Error: DOCKER_IMAGE environment variable required"
  exit 1
fi

DOCKERFILE=${DOCKERFILE:-Dockerfile}
BUILD_CONTEXT=${DOCKER_BUILD_CONTEXT:-.}

echo "========================================"
echo "Publishing $DOCKER_IMAGE:$VERSION"
echo "========================================"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN: validating build of $DOCKER_IMAGE:$VERSION"
  docker buildx build --call=check --file "$DOCKERFILE" "$BUILD_CONTEXT"
  echo "DRY_RUN: skipping docker build and push"
  exit 0
fi

echo "Building Docker image..."
docker build \
  --file "$DOCKERFILE" \
  -t "$DOCKER_IMAGE:$VERSION" \
  -t "$DOCKER_IMAGE:latest" \
  "$BUILD_CONTEXT"

echo "Pushing Docker image..."
docker push "$DOCKER_IMAGE:$VERSION"
docker push "$DOCKER_IMAGE:latest"

echo "========================================"
echo "Publish complete!"
echo "========================================"
echo ""
echo "Published:"
echo "  - Docker: $DOCKER_IMAGE:$VERSION"
echo "  - Docker: $DOCKER_IMAGE:latest"
