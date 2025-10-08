# Function: switchActiveTenant()

> **switchActiveTenant**(`tenantId`): `Promise`\<[`SwitchActiveTenantResponse`](../type-aliases/SwitchActiveTenantResponse.md)\>

Defined in: tenants/switch-tenant.ts:112

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

## Parameters

### tenantId

`string`

The ID of the tenant to switch to (must be a tenant the user belongs to)

## Returns

`Promise`\<[`SwitchActiveTenantResponse`](../type-aliases/SwitchActiveTenantResponse.md)\>

Promise resolving to a new JWT token and success confirmation

## Throws

When OMNIBASE_AUTH_URL environment variable is not configured

## Throws

When the tenantId parameter is missing or empty

## Throws

When the user doesn't have access to the specified tenant

## Throws

When the user is not authenticated

## Throws

When the specified tenant doesn't exist

## Throws

When the API request fails due to network issues

## Throws

When the server returns an error response (4xx, 5xx status codes)

## Examples

Basic tenant switching:
```typescript
const result = await switchActiveTenant('tenant_xyz789');

// Now all API calls will be in the context of tenant_xyz789
const tenantData = await getCurrentTenantData();
```

Using with tenant-aware data fetching:
```typescript
// Switch tenant and immediately fetch tenant-specific data
const switchAndLoadTenant = async (tenantId: string) => {
  try {
    // Switch to new tenant context
    const switchResult = await switchActiveTenant(tenantId);

    // Update authentication token
    setAuthToken(switchResult.data.token);

    // Fetch data in new tenant context
    const [tenantInfo, userPermissions, tenantSettings] = await Promise.all([
      getTenantInfo(),
      getUserPermissions(),
      getTenantSettings()
    ]);

    return {
      tenant: tenantInfo,
      permissions: userPermissions,
      settings: tenantSettings
    };
  } catch (error) {
    console.error('Failed to switch tenant and load data:', error);
    throw error;
  }
};
```

## Since

1.0.0
