#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version argument required"
  exit 1
fi

if [ -z "$DOCKER_IMAGE" ]; then
  echo "Error: DOCKER_IMAGE environment variable required"
  exit 1
fi

echo "========================================"
echo "Publishing $DOCKER_IMAGE:$VERSION"
echo "========================================"

# Build Docker image
echo "Building Docker image..."
docker build \
  -t "$DOCKER_IMAGE:$VERSION" \
  -t "$DOCKER_IMAGE:latest" \
  .

# Push Docker image
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
