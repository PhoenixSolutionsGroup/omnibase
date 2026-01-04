#!/bin/bash
set -e

# Get repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Bundle OpenAPI spec
redocly bundle apps/api/docs/info.yaml -o apps/api/docs/openapi.yaml
