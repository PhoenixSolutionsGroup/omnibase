#!/bin/bash

# Preview what versions would be released without actually releasing

PACKAGES=(
  "sdk/framework/react:react"
  "sdk/framework/nextjs:nextjs"
  "sdk/component/shadcn:shadcn"
  "packages/cli:cli"
  "apps/api:api"
  "docker/auth:auth"
  "docker/permissions:permissions"
)

echo "========================================"
echo "Release Preview (dry-run)"
echo "========================================"
echo ""

for entry in "${PACKAGES[@]}"; do
  path="${entry%%:*}"
  name="${entry##*:}"

  echo "📦 $name ($path)"
  echo "----------------------------------------"

  cd "$path"
  npx semantic-release --dry-run 2>&1 | grep -E "(next release version|no release)" || echo "  No release triggered"
  cd - > /dev/null

  echo ""
done
