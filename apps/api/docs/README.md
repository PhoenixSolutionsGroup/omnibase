# API Docs

`openapi.json` is generated from huma-typed Go handlers — not hand-written. Do not edit manually.

## Regenerate

```bash
# from public/
bun run generate:openapi   # dump openapi.json from running stack via testenv
bun run generate:sdk       # bundle + regen JS + Go SDKs
```

The bundle step runs `TestDumpOpenAPI` in `apps/api/tests/testenv`, which boots the testcontainers stack (reattaches if already up), spins the API in-process, curls `/openapi.json`, and writes it to `docs/openapi.json`.

## Versioning

Set `API_VERSION=0.21.0` before bundling to stamp the spec. Defaults to `"local"`.

## Source of truth

- Request/response shapes: `Input` / `Output` structs on handlers in `internal/handlers/v1/<domain>/`
- Validation: `required:"true"`, `format:"email"`, `minLength`, `enum:"a,b"` struct tags
- Auth: `huma.Operation.Security` + `Middlewares` set in `internal/routes/v1/<domain>.go`
- Top-level info / security schemes: `internal/server/server.go`
