# OmniBase API

Go REST API for OmniBase, built with Gin framework and GORM.

## Tech Stack

- **Go 1.24+** with Gin framework
- **PostgreSQL** with GORM ORM and Row-Level Security
- **Ory Kratos/Keto** for authentication and permissions
- **Stripe** for payment processing
- **S3-compatible storage** for file operations

## Directory Structure

```
├── main.go              # Entry point
├── internal/
│   ├── config/          # Environment configuration
│   ├── database/        # Database connection (GORM + PostgreSQL)
│   ├── handlers/        # HTTP request handlers
│   │   └── v1/          # Version 1 handlers
│   ├── middleware/      # Auth, CORS, logging middleware
│   ├── models/          # GORM data models
│   ├── routes/          # Route registration
│   │   └── v1/          # Version 1 routes
│   ├── service/         # Business logic layer
│   │   └── v1/
│   └── static/          # Templates and static assets
├── docs/                # OpenAPI 3.1 specification
│   ├── paths/           # Endpoint definitions
│   └── schemas/         # Model definitions
└── tests/               # Integration tests
```

## Getting Started

### Prerequisites

- Go 1.24+
- PostgreSQL database
- Required environment variables (see Configuration)

### Running

```bash
# Development
go run main.go

# Build and run
go build -o api && ./api

# Hot-reload (if air is configured)
air
```

The server starts on port 8080 by default (configurable via `PORT` env var).

## API Modules

The API exposes endpoints under `/api/v1/`:

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 6 | Session and authentication |
| Tenants | 18 | Multi-tenant management, users, roles |
| Stripe | 9 | Stripe configuration management |
| Payments | 3 | Checkout and billing portal |
| Storage | 3 | File operations (S3/R2) |
| Email | 3 | Email template management |
| Permissions | 2 | Keto permission checks |
| Events | 1 | WebSocket/SSE events |
| Database | 1 | Migration operations |

Health check available at `/health`.

## Configuration

Key environment variables:

```bash
# Server
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=omnibase
DB_SSLMODE=disable

# Authentication (Ory Kratos)
AUTH_URL=
AUTH_ADMIN_URL=
AUTH_JWT_JWKS=

# Permissions (Ory Keto)
PERMISSIONS_READ_URL=
PERMISSIONS_WRITE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage (S3-compatible)
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET_NAME=

# Email
SMTP_CONNECTION_URI=
SMTP_FROM_EMAIL=
```

## Development

### OpenAPI Documentation

```bash
bun run openapi:lint      # Validate specs
bun run openapi:bundle    # Generate bundled spec
bun run openapi:preview   # Preview documentation
```

### Testing

```bash
bun run test:api:integration:local  # K6 integration tests
bun run test:api:contract           # Schemathesis contract tests
```

### SDK Generation

```bash
bun run generate:sdk      # Generate TypeScript + Go SDKs from OpenAPI
```

## Code Conventions

- Use `handlers.NewSuccessResponse()`, `handlers.NewBadRequestResponse()`, etc. for HTTP responses
- Update OpenAPI docs in `docs/` when modifying endpoints
- Use structured logging with context values instead of inline comments
- Follow the handler → service → model separation pattern
