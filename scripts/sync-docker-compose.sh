#!/bin/bash
set -e

# Sync docker-compose.base.yml with the newly released Docker image version
# This script is called after a Docker image is published to Docker Hub
#
# Usage: sync-docker-compose.sh <service> <new_version>
# Example: sync-docker-compose.sh auth 0.3.2

SERVICE=$1
NEW_VERSION=$2

if [ -z "$SERVICE" ] || [ -z "$NEW_VERSION" ]; then
  echo "Usage: sync-docker-compose.sh <service> <new_version>"
  echo "Example: sync-docker-compose.sh auth 0.3.2"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/../packages/cli/docker/docker-compose.base.yml"

# Map service names to their image patterns
case "$SERVICE" in
  auth)
    IMAGE_PATTERN="phoenixsolutionsgroup/omnibase-auth"
    ;;
  permissions)
    IMAGE_PATTERN="phoenixsolutionsgroup/omnibase-permissions"
    ;;
  api)
    IMAGE_PATTERN="phoenixsolutionsgroup/omnibase-api"
    ;;
  *)
    echo "Error: Unknown service '$SERVICE'. Supported: auth, permissions, api"
    exit 1
    ;;
esac

# Extract current version from docker-compose.base.yml
OLD_VERSION=$(grep -oP "${IMAGE_PATTERN}:\K[0-9]+\.[0-9]+\.[0-9]+" "$COMPOSE_FILE" | head -1)

if [ -z "$OLD_VERSION" ]; then
  echo "Error: Could not find current version for $IMAGE_PATTERN in $COMPOSE_FILE"
  exit 1
fi

echo "========================================"
echo "Syncing docker-compose.base.yml"
echo "========================================"
echo "Service: $SERVICE"
echo "Image: $IMAGE_PATTERN"
echo "Old version: $OLD_VERSION"
echo "New version: $NEW_VERSION"

# Check if versions are the same
if [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "Version unchanged, nothing to sync"
  exit 0
fi

# Determine bump type by comparing versions
OLD_MAJOR=$(echo "$OLD_VERSION" | cut -d. -f1)
OLD_MINOR=$(echo "$OLD_VERSION" | cut -d. -f2)
NEW_MAJOR=$(echo "$NEW_VERSION" | cut -d. -f1)
NEW_MINOR=$(echo "$NEW_VERSION" | cut -d. -f2)

if [ "$NEW_MAJOR" -gt "$OLD_MAJOR" ]; then
  BUMP_TYPE="major"
  COMMIT_PREFIX="feat(cli)!"
elif [ "$NEW_MINOR" -gt "$OLD_MINOR" ]; then
  BUMP_TYPE="minor"
  COMMIT_PREFIX="feat(cli)"
else
  BUMP_TYPE="patch"
  COMMIT_PREFIX="fix(cli)"
fi

echo "Bump type: $BUMP_TYPE"
echo ""

# Update docker-compose.base.yml
sed -i "s|${IMAGE_PATTERN}:${OLD_VERSION}|${IMAGE_PATTERN}:${NEW_VERSION}|g" "$COMPOSE_FILE"

echo "Updated $COMPOSE_FILE"

# Stage the file
git add "$COMPOSE_FILE"

# Commit with appropriate message type
# The [skip ci] prevents infinite loops, but the change to packages/cli/ will trigger CLI release on next run
COMMIT_MSG="${COMMIT_PREFIX}: sync ${SERVICE} docker image to ${NEW_VERSION} [skip ci]"

echo "Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push the changes
echo "Pushing changes..."
git push origin main

echo ""
echo "========================================"
echo "Sync complete!"
echo "========================================"
echo "The CLI will pick up this change in the next release cycle."
