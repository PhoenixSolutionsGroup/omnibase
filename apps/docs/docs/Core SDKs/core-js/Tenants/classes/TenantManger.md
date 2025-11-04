# Class: TenantManger

Defined in: [tenants/management.ts:206](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L206)

Tenant management operations handler

This class provides core tenant lifecycle management operations including
creation, deletion, and active tenant switching. It handles all the fundamental
operations needed to manage tenants in a multi-tenant application with
integrated billing and row-level security.

The manager handles:
- Tenant creation with Stripe billing integration
- Secure tenant deletion with data cleanup
- Active tenant switching with JWT token management
- User permission validation for all operations

All operations are performed within the authenticated user context and
respect tenant ownership and permission rules.

## Example

```typescript
const tenantManager = new TenantManger(omnibaseClient);

// Create a new tenant
const tenant = await tenantManager.createTenant({
  name: 'Acme Corp',
  billing_email: 'billing@acme.com',
  user_id: 'user_123'
});

// Switch to the new tenant
await tenantManager.switchActiveTenant(tenant.data.tenant.id);

// Delete tenant (owner only)
await tenantManager.deleteTenant(tenant.data.tenant.id);
```

## Since

0.6.0

## Tenant Management

### Constructor

> **new TenantManger**(`omnibaseClient`): `TenantManger`

Defined in: [tenants/management.ts:217](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L217)

Creates a new TenantManger instance

Initializes the manager with the provided Omnibase client for making
authenticated API requests to tenant management endpoints.

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured Omnibase client instance

#### Returns

`TenantManger`

***

### createTenant()

> **createTenant**(`tenantData`): `Promise`\<[`CreateTenantResponse`](../type-aliases/CreateTenantResponse.md)\>

Defined in: [tenants/management.ts:257](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L257)

Creates a new tenant in the multi-tenant system

Establishes a new tenant with integrated Stripe billing setup and assigns
the specified user as the tenant owner. The operation creates the necessary
database records and returns a JWT token that enables Row-Level Security
access to the tenant's isolated data.

The function automatically handles Stripe customer creation for billing
integration and sets up the initial tenant configuration. The returned
token should be stored securely for subsequent API calls.

#### Parameters

##### tenantData

[`CreateTenantRequest`](../type-aliases/CreateTenantRequest.md)

Configuration object for the new tenant

#### Returns

`Promise`\<[`CreateTenantResponse`](../type-aliases/CreateTenantResponse.md)\>

Promise resolving to the created tenant with authentication token

#### Throws

When required fields (name, user_id) are missing or empty

#### Throws

When the API request fails due to network issues

#### Throws

When the server returns an error response (4xx, 5xx status codes)

#### Example

```typescript
const newTenant = await tenantManager.createTenant({
  name: 'Acme Corporation',
  billing_email: 'billing@acme.com',
  user_id: 'user_123'
});

console.log(`Tenant created: ${newTenant.data.tenant.id}`);
```

#### Since

0.6.0

***

### deleteTenant()

> **deleteTenant**(`tenantId`): `Promise`\<[`DeleteTenantResponse`](../type-aliases/DeleteTenantResponse.md)\>

Defined in: [tenants/management.ts:349](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L349)

Permanently deletes a tenant and all associated data

⚠️ **WARNING: This operation is irreversible and will permanently delete:**
- The tenant record and all metadata
- All user memberships and invitations for this tenant
- All tenant-specific data protected by row-level security
- Any tenant-related billing information
- All tenant configuration and settings

**Access Control:**
Only tenant owners can delete a tenant. This operation requires:
- User must be authenticated
- User must have 'owner' role for the specified tenant
- Tenant must exist and be accessible to the user

**Security Considerations:**
- All tenant data is immediately and permanently removed
- Other tenant members lose access immediately
- Any active sessions for this tenant are invalidated
- Billing subscriptions are cancelled (if applicable)
- Audit logs for deletion are maintained for compliance

#### Parameters

##### tenantId

`string`

The unique identifier of the tenant to delete

#### Returns

`Promise`\<[`DeleteTenantResponse`](../type-aliases/DeleteTenantResponse.md)\>

Promise resolving to a confirmation message

#### Throws

When the tenantId parameter is missing or empty

#### Throws

When the user is not authenticated

#### Throws

When the user is not an owner of the specified tenant

#### Throws

When the tenant doesn't exist or is not accessible

#### Throws

When the API request fails due to network issues

#### Throws

When the server returns an error response (4xx, 5xx status codes)

#### Example

```typescript
const tenantToDelete = 'tenant_abc123';

// Always confirm before deleting
const userConfirmed = confirm(
  'Are you sure you want to delete this tenant? This action cannot be undone.'
);

if (userConfirmed) {
  try {
    const result = await tenantManager.deleteTenant(tenantToDelete);
    console.log(result.data.message);

    // Redirect user away from deleted tenant
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Failed to delete tenant:', error);
  }
}
```

#### Since

0.6.0

***

### switchActiveTenant()

> **switchActiveTenant**(`tenantId`): `Promise`\<[`SwitchActiveTenantResponse`](../type-aliases/SwitchActiveTenantResponse.md)\>

Defined in: [tenants/management.ts:426](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L426)

Switches the user's active tenant context

Changes the user's active tenant to the specified tenant ID, updating
their authentication context and permissions. This function is essential
for multi-tenant applications where users belong to multiple tenants
and need to switch between them.

The function performs several operations:
- Validates that the user has access to the specified tenant
- Updates the user's active tenant in their session
- Generates a new JWT token with updated tenant claims
- Updates any cached tenant-specific data

After switching tenants, all subsequent API calls will be made within
the context of the new active tenant, with row-level security policies
applied accordingly. The new JWT token should be used for all future
authenticated requests.

#### Parameters

##### tenantId

`string`

The ID of the tenant to switch to (must be a tenant the user belongs to)

#### Returns

`Promise`\<[`SwitchActiveTenantResponse`](../type-aliases/SwitchActiveTenantResponse.md)\>

Promise resolving to a new JWT token and success confirmation

#### Throws

When the tenantId parameter is missing or empty

#### Throws

When the user doesn't have access to the specified tenant

#### Throws

When the user is not authenticated

#### Throws

When the specified tenant doesn't exist

#### Throws

When the API request fails due to network issues

#### Throws

When the server returns an error response (4xx, 5xx status codes)

#### Example

```typescript
const result = await tenantManager.switchActiveTenant('tenant_xyz789');

// Store the new token for future requests
console.log(`Switched to tenant. New token: ${result.data.token}`);

// Now all API calls will be in the context of tenant_xyz789
const tenantData = await getCurrentTenantData();
```

#### Since

0.6.0
