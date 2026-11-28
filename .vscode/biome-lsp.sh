#!/bin/sh
# when opening omnibase as work space, this is needed for biome to find the bin
set -e
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
if [ "${1:-}" = "__where_am_i" ]; then
	printf '%s\n' "$ROOT/.vscode/biome-lsp.sh"
	exit 0
fi
cd "$ROOT"
exec "$ROOT/node_modules/@biomejs/biome/bin/biome" "$@"
