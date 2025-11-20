# OpenAPI 3.1 Documentation

This directory contains the **modular OpenAPI 3.1 specification** for the Omnibase API. The specification is organized into separate files for better maintainability and bundled into a single file for consumption.

---

## 📁 Directory Structure

```
apps/api/docs/
├── openapi.yaml              # Main entry point
├── openapi-bundled.yaml      # Generated bundle (gitignored)
├── info.yaml                 # API metadata
├── paths/                    # Endpoint definitions (10 modules)
│   ├── auth.yaml             # 6 endpoints
│   ├── permissions.yaml      # 2 endpoints
│   ├── stripe.yaml           # 9 endpoints
│   ├── tenants.yaml          # 18 endpoints
│   ├── storage.yaml          # 3 endpoints
│   ├── email.yaml            # 3 endpoints
│   ├── database.yaml         # 1 endpoint
│   ├── payments.yaml         # 3 endpoints
│   ├── events.yaml           # 1 endpoint
│   └── keto_namespaces.yaml  # 1 endpoint
└── schemas/                  # Model definitions (10 modules)
    ├── common.yaml           # SuccessResponse, ErrorResponse
    ├── errors.yaml           # Standard error responses
    ├── auth.yaml
    ├── permissions.yaml
    ├── stripe.yaml
    ├── tenants.yaml
    ├── storage.yaml
    ├── email.yaml
    ├── database.yaml
    ├── payments.yaml
    ├── events.yaml
    └── keto_namespaces.yaml
```

**Total:** 48 endpoints across 10 functional modules

---

## 🔧 How to Generate OpenAPI Documentation

### From Root Directory

```bash
# Generate OpenAPI bundle (recommended)
bun run generate:openapi

# This will:
# 1. Install Redocly CLI dependencies
# 2. Validate all modular specs
# 3. Bundle them into apps/api/docs/openapi-bundled.yaml
```

### From API Directory

```bash
cd apps/api

# Install dependencies (first time only)
npm install

# Validate modular specs
npm run openapi:lint

# Bundle all specs into single file
npm run openapi:bundle

# Preview documentation in browser
npm run openapi:preview

# Or use the all-in-one script
./scripts/bundle-openapi.sh
```

### Output

The bundled specification will be generated at:
- **Path:** `apps/api/docs/openapi-bundled.yaml`
- **Size:** ~148KB
- **Format:** OpenAPI 3.1.0
- **Endpoints:** 48 total

---

## ✅ Key Improvements Over Swaggo

| Feature | Old (Swaggo) | New (Manual OpenAPI 3.1) |
|---------|-------------|--------------------------|
| **OpenAPI Version** | 2.0 | 3.1.0 |
| **oneOf Support** | ❌ No | ✅ Yes (fixes schemathesis) |
| **Organization** | Single generated file | 10 modular files |
| **Maintainability** | Inline comments | Separate YAML files |
| **Validation** | Limited | Full Redocly validation |
| **Documentation** | Auto-generated | Handcrafted with examples |

### Specific Fix: Permissions Endpoint

The permissions endpoints now properly use `oneOf` constraints to enforce mutually exclusive fields:

```yaml
CheckPermissionRequest:
  oneOf:
    - type: object
      required: [namespace, object, relation, subject_id]
      properties:
        subject_id:
          type: string
    - type: object
      required: [namespace, object, relation, subject_set]
      properties:
        subject_set:
          $ref: '#/components/schemas/SubjectSetRequest'
```

This fixes the schemathesis test failure where `subject_id` and `subject_set` must be mutually exclusive.

---

## 📝 Adding New API Endpoints

Follow this procedure when adding new handlers, routes, or models:

### Step 1: Identify the Module

Determine which functional module your endpoint belongs to:
- **Auth** - Authentication/session endpoints
- **Permissions** - Keto permission checks
- **Stripe** - Stripe configuration management
- **Tenants** - Tenant lifecycle, users, roles, subscriptions
- **Storage** - R2 file operations
- **Email** - Email template management
- **Database** - Migration operations
- **Payments** - Stripe checkout/portal
- **Events** - WebSocket/SSE events
- **Keto Namespaces** - Permission namespace deployment

Or create a new module if needed.

### Step 2: Define Schema Models

Edit or create `schemas/{module}.yaml`:

```yaml
openapi: 3.1.0
components:
  schemas:
    YourNewModel:
      type: object
      required:
        - field1
        - field2
      properties:
        field1:
          type: string
          description: Description of field1
          example: example-value
        field2:
          type: integer
          description: Description of field2
          example: 42
    
    YourNewRequest:
      type: object
      required:
        - data
      properties:
        data:
          type: string
    
    YourNewResponse:
      type: object
      properties:
        result:
          type: string
```

**Guidelines:**
- Use clear, descriptive names
- Add `description` fields
- Include `example` values
- Mark required fields
- Reference common types via `$ref: '../schemas/common.yaml#/components/schemas/ModelName'`

### Step 3: Define Path Endpoint

Edit or create `paths/{module}.yaml`:

```yaml
openapi: 3.1.0
paths:
  /api/v1/your-module/your-endpoint:
    post:
      operationId: yourOperation
      summary: Brief summary of what this does
      description: |
        Detailed description with multiple lines.
        
        ## Use Cases
        - Use case 1
        - Use case 2
        
        ## Authentication
        Requires session authentication.
      tags:
        - V1 Your Module
      security:
        - CookieAuth: []
        - SessionTokenAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '../schemas/your-module.yaml#/components/schemas/YourNewRequest'
      responses:
        '200':
          description: Success response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '../schemas/common.yaml#/components/schemas/SuccessResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '../schemas/your-module.yaml#/components/schemas/YourNewResponse'
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '../schemas/errors.yaml#/components/schemas/BadRequestResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '../schemas/errors.yaml#/components/schemas/UnauthorizedResponse'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '../schemas/errors.yaml#/components/schemas/InternalServerErrorResponse'
```

**Guidelines:**
- Use descriptive `operationId` (used for SDK method names)
- Add comprehensive `description` with use cases
- Use relative `$ref` paths: `../schemas/...`
- Include all relevant HTTP status codes
- Use `allOf` to combine `SuccessResponse` wrapper with data
- Add proper security schemes

### Step 4: Update Main Entry Point (if new module)

If you created a **new module**, add it to `openapi.yaml`:

```yaml
# Add to paths section
paths:
  # ... existing imports
  /api/v1/your-module:
    $ref: './paths/your-module.yaml#/paths/~1api~1v1~1your-module~1your-endpoint'

# Add to components.schemas section  
components:
  schemas:
    # ... existing imports
    YourNewModel:
      $ref: './schemas/your-module.yaml#/components/schemas/YourNewModel'
```

**Note:** The `~1` is the URL-encoded `/` character required by JSON Pointer syntax.

### Step 5: Validate and Bundle

```bash
cd apps/api

# Validate your changes
npm run openapi:lint

# Fix any errors, then bundle
npm run openapi:bundle

# Or use the helper script
./scripts/bundle-openapi.sh
```

### Step 6: Verify the Bundle

Check that your endpoint appears in the bundled spec:

```bash
# Search for your operationId
grep -n "operationId: yourOperation" apps/api/docs/openapi-bundled.yaml

# Or open in editor and search
code apps/api/docs/openapi-bundled.yaml
```

### Step 7: Commit Changes

```bash
# Commit the modular files (NOT the bundle)
git add apps/api/docs/schemas/your-module.yaml
git add apps/api/docs/paths/your-module.yaml
git add apps/api/docs/openapi.yaml  # if updated
git commit -m "docs(openapi): add your-endpoint to your-module"
```

**Note:** The bundled file (`openapi-bundled.yaml`) is gitignored and regenerated in CI.

---

## 🧪 Testing with Schemathesis

The bundled spec is used for automated API contract testing:

### Run Tests Locally

```bash
# Install schemathesis
pip install schemathesis

# Run tests against local server
schemathesis run apps/api/docs/openapi-bundled.yaml \
  --base-url http://localhost:8080 \
  --header "X-Service-Key: your-key" \
  --header "X-Tenant-ID: your-tenant-id"

# Run with authentication
schemathesis run apps/api/docs/openapi-bundled.yaml \
  --base-url http://localhost:8080 \
  --auth bearer:your-jwt-token
```

### Run from Root Package Script

```bash
# Setup test environment, run schemathesis, cleanup
bun run test:api
```

### View Test Reports

```bash
# View JUnit/HAR reports
bun run test:api:results
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/openapi.yml`:

```yaml
name: OpenAPI Validation

on:
  pull_request:
    paths:
      - 'apps/api/docs/**'
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: apps/api
        run: npm install
      
      - name: Lint OpenAPI specs
        working-directory: apps/api
        run: npm run openapi:lint
      
      - name: Bundle OpenAPI specs
        working-directory: apps/api
        run: npm run openapi:bundle
      
      - name: Upload bundled spec as artifact
        uses: actions/upload-artifact@v4
        with:
          name: openapi-spec
          path: apps/api/docs/openapi-bundled.yaml
      
      - name: Run Schemathesis tests
        working-directory: apps/api
        run: |
          pip install schemathesis
          schemathesis run docs/openapi-bundled.yaml --base-url ${{ secrets.API_BASE_URL }}
```

---

## 🚀 SDK Generation

The bundled OpenAPI spec is used to generate client SDKs:

```bash
# Generate both JS and Go SDKs
bun run generate:sdk

# This will:
# 1. Bundle OpenAPI specs (bun run generate:openapi)
# 2. Generate TypeScript SDK (bun run generate:sdk:js)
# 3. Generate Go SDK (bun run generate:sdk:go)
```

**SDK Output Locations:**
- **TypeScript:** `sdk/core/js/`
- **Go:** `sdk/core/go/`

---

## 📚 Migration Notes

### Old Swaggo Documentation

The old swaggo-generated docs are preserved in `apps/api/docs-old/` for reference during the migration period.

**To regenerate old docs (if needed):**
```bash
bun run generate:openapi:swaggo
```

**Safe to remove after validation period:**
```bash
rm -rf apps/api/docs-old/
```

### Inline Comments

Handler files still contain swaggo annotation comments for reference. These can be gradually removed as endpoints are verified in the new spec.

---

## ��️ Maintenance Tips

### Validation Best Practices

- **Always validate** before committing: `npm run openapi:lint`
- **Check for unused components:** Review validation warnings
- **Test the bundle:** Ensure endpoints are accessible after bundling

### Naming Conventions

- **operationId:** Use camelCase (e.g., `createTenant`, `listUsers`)
- **Schema names:** Use PascalCase (e.g., `CreateTenantRequest`, `UserResponse`)
- **File names:** Use kebab-case matching handler names (e.g., `tenants.yaml`, `keto_namespaces.yaml`)

### Common Patterns

#### Wrapping Responses

All success responses should use the common wrapper:

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
                  $ref: '../schemas/your-module.yaml#/components/schemas/YourData'
```

#### Using oneOf for Mutually Exclusive Fields

When fields are mutually exclusive (e.g., `role_id` OR `role_name`):

```yaml
YourRequest:
  oneOf:
    - type: object
      required: [field1, option_a]
      additionalProperties: false
      properties:
        field1: { type: string }
        option_a: { type: string }
    - type: object
      required: [field1, option_b]
      additionalProperties: false
      properties:
        field1: { type: string }
        option_b: { type: string }
```

---

## 📞 Support

For questions or issues with OpenAPI documentation:

1. Check validation output: `npm run openapi:lint`
2. Review this README
3. Inspect the bundled output: `apps/api/docs/openapi-bundled.yaml`
4. Consult existing modules for patterns

---

## 📊 Statistics

- **Total Endpoints:** 48
- **Modules:** 10
- **Schema Files:** 12
- **Path Files:** 10
- **OpenAPI Version:** 3.1.0
- **Bundle Size:** ~148KB
- **oneOf Usages:** 9 (permissions, tenants roles)

---

**Last Updated:** 2025-11-11 (Migration from Swaggo to OpenAPI 3.1)