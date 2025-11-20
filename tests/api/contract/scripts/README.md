# API Testing Scripts

This directory contains scripts for setting up and managing the Schemathesis API testing environment.

## Prerequisites

- Kratos admin API running at `http://localhost:4434` (or set `KRATOS_ADMIN_URL`)
- Your API running at `http://127.0.0.1:8080` (or set `API_BASE_URL`)
- Service key set to `VERY_SECURE_KEY` (or set `SERVICE_KEY`)

## Scripts

### setup-test-env.sh

Creates a complete test environment for API testing:

1. Creates a Kratos identity (test user)
2. Creates a tenant with that user as owner
3. Saves environment variables to `.test-env`

**Usage:**
```bash
./scripts/setup-test-env.sh
```

**Environment Variables:**
- `KRATOS_ADMIN_URL` - Kratos admin API URL (default: `http://localhost:4434`)
- `API_BASE_URL` - Your API base URL (default: `http://127.0.0.1:8080`)
- `SERVICE_KEY` - Service authentication key (default: `VERY_SECURE_KEY`)

### cleanup-test-env.sh

Cleans up the test environment:

1. Deletes the tenant
2. Deletes the Kratos identity
3. Removes the `.test-env` file

**Usage:**
```bash
./scripts/cleanup-test-env.sh
```

### view-test-results.sh

Displays a summary of the latest test results and shows where to find detailed reports.

**Usage:**
```bash
./scripts/view-test-results.sh
```

Shows:
- Latest test run summary
- Pass/fail statistics
- List of all report files
- File sizes and locations

## Using with NPM/Bun Scripts

### Quick Start

Run the full test suite (setup + test + results summary):
```bash
bun run test:api
```

### Individual Commands

Setup test environment:
```bash
bun run test:api:setup
```

Run schemathesis tests (with auto setup/cleanup):
```bash
bun run test:api:spec
```

View test results summary:
```bash
bun run test:api:results
```

Cleanup test environment:
```bash
bun run test:api:cleanup
```

## How It Works

1. **Setup** creates a test user and tenant, saving the IDs to `.test-env`
2. **Test** sources `.test-env` and runs schemathesis with the required headers
3. **Reports** are generated in `test-reports/` directory
4. **Cleanup** removes all created resources

The test script automatically passes headers via command line:
- `-H "X-Service-Key:$TEST_SERVICE_KEY"` - Service authentication
- `-H "X-Tenant-ID:$TEST_TENANT_ID"` - Tenant context

## Test Environment File

The `.test-env` file contains:
```bash
export TEST_USER_ID="..."
export TEST_TENANT_ID="..."
export TEST_SERVICE_KEY="VERY_SECURE_KEY"
export TEST_API_URL="http://127.0.0.1:8080"
export TEST_KRATOS_ADMIN_URL="http://localhost:4434"
```

**Note:** This file is gitignored and should not be committed to version control.

## Test Reports

After running tests, you'll find reports in `test-reports/`:

- **JUnit XML** (`junit-*.xml`) - Structured test results for CI/CD integration
- **HAR files** (`har-*.json`) - Complete HTTP Archive with all requests/responses

### Viewing Reports

**Quick Summary:**
```bash
bun run test:api:results
```

**JUnit XML:**
- Open in any IDE or XML viewer
- Parse with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- View with: `cat test-reports/junit-*.xml`

**HAR Files:**
- Import into Chrome DevTools: Network tab → Import HAR file
- Use online viewers like [HAR Viewer](http://www.softwareishard.com/har/viewer/)
- View raw JSON: `cat test-reports/har-*.json | jq`

Reports are timestamped (e.g., `junit-20251110T124204Z.xml`) so multiple test runs don't overwrite each other.
