# K6 API Test Coverage

## Philosophy

These tests serve dual purposes:
1. **Integration Testing**: Validate critical user journeys and API workflows
2. **Performance Testing**: Measure response times and throughput under load

We focus on **tenant-centric workflows** that mirror real-world usage patterns, testing sequences of operations rather than isolated endpoints.

## Test Structure

```
tests/api/k6/
├── tenants/          # Tenant lifecycle and multi-tenancy tests
├── client.ts         # Shared API client configuration
├── sdk.ts            # Auto-generated OpenAPI client
└── index.ts          # Test orchestration and scenarios
```

## Authentication Strategy

All tests use **service key authentication** (`X-Service-Key` header) with explicit user/tenant context:
- `X-User-Id`: Specifies which user is performing the action
- `X-Tenant-Id`: Specifies tenant context for operations

This approach enables:
- Predictable test execution without session management
- Parallel test runs with multiple virtual users (VUs)
- Direct API testing without browser-based authentication flows

## Tenant Test Scenarios

### 01: Tenant Creation Lifecycle

**Purpose**: Validate complete tenant onboarding flow from user creation through tenant setup.

**Flow**:
1. Create user with unique email/password
2. Create tenant with billing email (triggers Stripe customer)
3. Verify Stripe customer ID exists in tenant object
4. Verify owner role auto-assigned to creator
5. List tenant users and confirm creator with owner role
6. Generate tenant JWT and verify it works
7. List user's tenants and verify new tenant is active

**Key Assertions** (15+):
- User creation success
- Tenant creation with Stripe integration
- Stripe customer ID populated
- Owner role assignment
- JWT token generation
- Active tenant tracking

**Why This Matters**:
- Tests the critical path users take to start using the platform
- Validates Stripe integration at tenant creation
- Ensures RBAC (Role-Based Access Control) setup works automatically
- Confirms JWT generation for database access

---

### 02: Multi-Tenant Switching

**Purpose**: Validate users can manage multiple tenant memberships and switch between them.

**Flow**:
1. Create single user
2. Create first tenant (becomes active)
3. Create second tenant (becomes new active tenant)
4. List tenants and verify both exist
5. Verify second tenant is active (last created behavior)
6. Switch to first tenant
7. Verify active tenant changed in tenant list
8. Generate JWT for first tenant context
9. Switch back to second tenant
10. Verify final state with second tenant active

**Key Assertions** (25+):
- Both tenants exist in user's tenant list
- Only one tenant is active at a time
- Active status updates correctly after switch
- JWT tokens differ between tenants
- Tenant switching is bidirectional
- State consistency across operations

**Why This Matters**:
- Validates multi-tenant architecture core functionality
- Tests that users can belong to multiple organizations
- Ensures tenant context switches properly
- Confirms JWT tokens carry correct tenant context
- Validates active tenant state management

---

## Test Patterns

### Unique Resource Creation
Every test uses `Date.now()` timestamps to ensure unique emails/names:
```typescript
const timestamp = Date.now();
const email = `test-${timestamp}@example.com`;
```

This enables:
- Parallel test execution without conflicts
- Multiple VUs running simultaneously
- No cleanup required between runs

### Progressive Validation
Tests follow a pattern:
1. Perform action
2. Check HTTP status code
3. Verify response structure
4. Validate business logic
5. Confirm side effects

Early returns prevent cascading failures when critical steps fail.

### Client Isolation
Each test creates its own client instance:
```typescript
const client = createClient();
```

This ensures:
- No shared state between tests
- VU-safe execution in load tests
- Clean separation of concerns

---

## Running Tests

### Integration Tests (Single VU)
```bash
k6 run tests/api/k6/index.ts
```

### Performance Tests (Load)
```bash
k6 run --vus 10 --duration 30s tests/api/k6/index.ts
```

### Environment Variables
- `API_URL`: Base URL for API (default: `http://localhost:8080`)
- `SERVICE_KEY`: Service authentication key (default: `VERY_SECRET_KEY`)

---

## Planned Test Scenarios

### 03: Tenant User Invites

**Purpose**: Validate tenant invitation workflow and role assignment upon acceptance.

**Flow**:
1. Create tenant with owner user
2. Send invite to new user's email with specific role
3. Verify invite created with 7-day expiry token
4. Accept invite (as invited user)
5. Verify user added to tenant with correct role
6. Verify invited user can list tenant users
7. Verify invite marked as used

**Why**: Tests team collaboration onboarding flow.

---

### 04: Role Management

**Purpose**: Validate custom role creation and permission assignment.

**Flow**:
1. Create tenant
2. Create custom role with specific permissions
3. Assign custom role to user
4. Verify user has role permissions in Keto
5. Update role permissions
6. Verify permission changes propagate
7. Delete role and verify cleanup

**Why**: Tests RBAC flexibility and permission management.

---

### 05: Tenant Deletion

**Purpose**: Validate complete tenant cleanup including Stripe and permissions.

**Flow**:
1. Create tenant with multiple users
2. Create custom roles and permissions
3. Add Stripe subscription
4. Delete tenant
5. Verify Stripe customer archived
6. Verify all Keto relationships deleted
7. Verify users' tenant list updated
8. Verify database records cascaded

**Why**: Tests data cleanup and prevents orphaned resources.

---

### 06: Subscription Management

**Purpose**: Validate Stripe subscription lifecycle for tenant.

**Flow**:
1. Create tenant
2. Add subscription for specific plan
3. Verify subscription active in Stripe
4. List tenant subscriptions
5. Verify billing status active
6. Cancel subscription
7. Verify subscription canceled in Stripe
8. Verify billing status updated

**Why**: Tests billing integration and subscription state management.

---

(This should be in its own `permissions` test suite)
### 07: Permission Checks

**Purpose**: Validate RBAC enforcement across tenant operations.

**Flow**:
1. Create tenant with owner and member users
2. Attempt restricted operation as member (should fail)
3. Verify permission check returns false
4. Grant permission to member
5. Attempt operation again (should succeed)
6. Remove permission
7. Verify access revoked

**Why**: Tests permission system prevents unauthorized actions.

---

## Metrics to Monitor

When running performance tests, watch for:
- **http_req_duration**: P95 should be < 500ms for tenant operations
- **http_req_failed**: Should remain at 0% for valid requests
- **checks**: Should maintain 100% pass rate under load
- **iterations**: Measures completed test runs per second

---

## Contributing

When adding new tenant tests:
1. Follow the `XX-descriptive-name.ts` naming convention
2. Include comprehensive JSDoc explaining the test purpose
3. Use service key authentication with explicit user/tenant headers
4. Add 15+ meaningful assertions covering the workflow
5. Return test context (user, tenant, tokens) for debugging
6. Log completion with relevant IDs for traceability

Keep tests focused on **user journeys** rather than individual endpoints. Test the workflows customers actually use.
