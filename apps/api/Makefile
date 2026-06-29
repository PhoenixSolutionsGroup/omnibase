codegen:
	sqlc generate && echo "SQLC Generated" && mockery

build:
	go build ./...

openapi-lint:
	@cd ../../ && npx --yes @redocly/cli lint apps/api/docs/info.yaml

openapi-bundle:
	@cd ../../ && npx --yes @redocly/cli bundle apps/api/docs/info.yaml -o apps/api/docs/openapi.yaml
	@echo "✓ OpenAPI bundled"

openapi: openapi-lint openapi-bundle

sdk:
	@OUT=$$(cd ../../ && bun run generate:sdk 2>&1) || { echo "$$OUT"; exit 1; }
	@echo "$(DOCS_HASH)" > $(SDK_HASH_FILE)
	@echo "✓ SDK generated"

DOCS_HASH := $(shell find docs -type f \( -name '*.yaml' -o -name '*.yml' \) -print0 2>/dev/null | sort -z | xargs -0 sha256sum 2>/dev/null | sha256sum | cut -d' ' -f1)
SDK_HASH_FILE := .sdk-docs.hash

sdk-if-changed:
	@if [ -f $(SDK_HASH_FILE) ] && [ "$$(cat $(SDK_HASH_FILE))" = "$(DOCS_HASH)" ]; then \
		echo "✓ SDK up-to-date (docs unchanged)"; \
	else \
		OUT=$$(cd ../../ && bun run generate:sdk 2>&1) || { echo "$$OUT"; exit 1; }; \
		echo "$(DOCS_HASH)" > $(SDK_HASH_FILE); \
		echo "✓ SDK generated"; \
	fi

testenv-down:
	cd tests/testenv && docker compose -f docker-compose.test-deps.yml -p ob-api-test-deps down --volumes --remove-orphans

testenv-logs:
	cd tests/testenv && docker compose -f docker-compose.test-deps.yml -p ob-api-test-deps logs -f

# Default: silent (no per-handler logs, no timing prints). Stack kept warm between runs.
# Verbose: `make test-integration VERBOSE=1` — shows server logs + test trace.
GO_TEST_FLAGS := -count=1 -timeout 5m
LOG_LEVEL := ERROR
ifeq ($(VERBOSE),1)
	GO_TEST_FLAGS += -v
	LOG_LEVEL := DEBUG
endif
TEST_ENV := GIN_MODE=release LOG_LEVEL=$(LOG_LEVEL) LOG_FORMAT=pretty

test: test-unit test-integration test-e2e

test-unit:
	$(TEST_ENV) go test ./internal/... $(GO_TEST_FLAGS)

test-integration: sdk-if-changed
	$(TEST_ENV) KEEP_STACK=1 go test ./tests/integration/... $(GO_TEST_FLAGS)

test-e2e: sdk-if-changed
	$(TEST_ENV) KEEP_STACK=1 go test ./tests/e2e/... $(GO_TEST_FLAGS) -p 1
