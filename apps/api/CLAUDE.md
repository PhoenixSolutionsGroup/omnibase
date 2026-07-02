# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start API server
go run ./cmd/server

# Build binary
go build -o api

# Hot-reload development (requires air)
air

# Validate OpenAPI specs
cd apps/api && npm run openapi:lint

# Bundle OpenAPI specs
cd apps/api && npm run openapi:bundle

# Generate SDK from OpenAPI (from public/ root)
bun run generate:sdk

# Run unit + integration + e2e tests (from apps/api/)
make test
```

## Critical Rules

### 1. HTTP Response Helpers

Always use `handlers.NewXYZResponse()` functions for HTTP responses - never use raw `ctx.JSON()`:

```go
import "api/internal/handlers"

// Success (200)
handlers.NewSuccessResponse(ctx, data)

// Errors
handlers.NewBadRequestResponse(ctx, "error message")     // 400
handlers.NewUnauthorizedResponse(ctx, "message")         // 401
handlers.NewForbiddenResponse(ctx, "message")            // 403
handlers.NewNotFoundResponse(ctx, "message")             // 404
handlers.NewNotAcceptableResponse(ctx, "message")        // 406
handlers.NewMethodNotAllowedResponse(ctx, "message")     // 405
handlers.NewConflictResponse(ctx, "message")             // 409
handlers.NewTooManyRequestsResponse(ctx, "message")      // 429
handlers.NewInternalServerErrorResponse(ctx, err)        // 500

// Stripe-specific error handling
if handlers.HandleStripeError(ctx, err) {
    return  // Error was handled
}
```

### 2. OpenAPI Documentation Updates

When modifying handlers, routes, or models, update the corresponding OpenAPI docs in `docs/`:

- **Schemas**: `docs/schemas/{module}.yaml`
- **Paths**: `docs/paths/{module}.yaml`
- **New routes**: Must be added to `docs/info.yaml`

**NEVER modify the `version` field in `info.yaml`.**

Validate after changes:
```bash
npm run openapi:lint
npm run openapi:bundle
```

### 3. Integration Tests

When adding/modifying endpoints, update integration tests in
`apps/api/tests/integration/v1/<domain>/`. Each route gets a test file
hitting the live API via the generated Go SDK against the testcontainers
stack (`tests/testenv`).

```
tests/integration/v1/
├── auth/
├── db/
├── email/
├── permissions/
├── storage/
└── tenants/{invites,roles,subscriptions,users,...}
```

Test pattern:
```go
func TestYourEndpoint(t *testing.T) {
    env := testenv.Start(t)
    testenv.StartAPI(t, env)
    client := testenv.NewSDKClient(t)

    out, resp, err := client.V1YourAPI.YourEndpoint(helpers.Ctx()).
        XUserId(userID).Execute()
    helpers.EnsureOK(t, resp, err, "yourEndpoint")
    require.NotNil(t, out)
}
```

Perf tests in `tests/perf/` use Go + vegeta. Gated by `PERF=1`. Env knobs:
`PERF_RATE` (req/s, default 10), `PERF_DURATION` (default 10s). Run via
`make test-perf`.

## Architecture

### Project Structure

```
internal/
├── config/         # Environment configuration (singleton pattern)
├── database/       # GORM PostgreSQL connection (singleton)
├── handlers/       # HTTP handlers
│   ├── responses.go   # Shared response helpers
│   └── v1/            # Version 1 handlers
│       └── tenants/   # Tenant-specific handlers
├── middleware/     # Auth, CORS, logging middleware
├── models/         # GORM models with TableName() methods
├── routes/         # Route registration
│   └── v1/            # Version 1 routes
├── service/        # Business logic layer
│   └── v1/
└── logger/         # Structured slog logging
```

### Adding a New Route

1. **Create handler** in `internal/handlers/v1/{feature}.go`:
```go
type YourHandler struct {
    cfg *config.Config
    db  *gorm.DB
}

func NewYourHandler(cfg *config.Config) *YourHandler {
    return &YourHandler{cfg: cfg, db: database.GetDB()}
}

func (h *YourHandler) YourEndpoint(ctx *gin.Context) {
    // Use handlers.NewSuccessResponse / handlers.NewBadRequestResponse etc.
}
```

2. **Create route setup** in `internal/routes/v1/{feature}.go`:
```go
func SetUpYourRoutes(router *gin.RouterGroup) {
    cfg := config.New()
    handler := v1.NewYourHandler(cfg)
    authMiddleware := middleware.NewAuthMiddleware(cfg)

    router.Use(authMiddleware.RequireAuthHeaders())
    router.Use(authMiddleware.RequireSessionOrServiceKey())

    router.POST("/endpoint", handler.YourEndpoint)
}
```

3. **Register in** `internal/routes/v1/main.go`:
```go
SetUpYourRoutes(group.Group("/your-feature"))
```

4. **Add OpenAPI docs**:
   - Create `docs/schemas/{feature}.yaml` for request/response models
   - Create `docs/paths/{feature}.yaml` for endpoint definitions
   - Add path references to `docs/info.yaml`

5. **Add perf test** in `tests/perf/{feature}_test.go` if the endpoint has latency SLOs

### Authentication Patterns

Middleware options for routes:
```go
// Require any auth header present
authMiddleware.RequireAuthHeaders()

// Session only (cookie or JWT)
authMiddleware.RequireSession()

// Service key only
authMiddleware.RequireServiceKey()

// Either session or service key
authMiddleware.RequireSessionOrServiceKey()
```

Context values set by middleware:
- `user_id` - UUID string
- `tenant_id` - UUID string
- `session` - Kratos session object
- `identity` - User identity
- `is_service_auth` - Boolean

## OpenAPI Schema Guidelines

### Use Named `$ref` Schemas for `oneOf`

When using `oneOf`, always use named `$ref` schemas instead of inline objects:

```yaml
# Bad - generates OneOf, OneOf1, etc.
MyRequest:
  oneOf:
    - type: object
      properties:
        field_a: ...

# Good - generates MyRequestWithFieldA
MyRequestWithFieldA:
  type: object
  properties:
    field_a: ...

MyRequest:
  oneOf:
    - $ref: '#/components/schemas/MyRequestWithFieldA'
```

### Response Wrapping

All success responses use the common wrapper:
```yaml
responses:
  '200':
    content:
      application/json:
        schema:
          allOf:
            - $ref: '../schemas/common.yaml#/components/schemas/SuccessResponse'
            - type: object
              properties:
                data:
                  $ref: '../schemas/{module}.yaml#/components/schemas/YourData'
```

### Path References in info.yaml

Use URL-encoded paths (`~1` = `/`):
```yaml
/api/v1/your-module/endpoint:
  $ref: './paths/your-module.yaml#/paths/~1api~1v1~1your-module~1endpoint'
```


## Logging

Use structured logging with context values instead of code comments:
```go
logger.Logger.Info("Creating tenant", "user_id", userId, "tenant_name", name)
logger.Logger.Error("Stripe API failed", "error", err, "customer_id", custId)
```

Levels: `Trace`, `Debug`, `Info`, `Warn`, `Error`
