# Function: deleteTenant()

> **deleteTenant**(`tenantId`): `Promise`\<[`DeleteTenantResponse`](../type-aliases/DeleteTenantResponse.md)\>

Defined in: tenants/delete-tenant.ts:91

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

## Parameters

### tenantId

`string`

The unique identifier of the tenant to delete

## Returns

`Promise`\<[`DeleteTenantResponse`](../type-aliases/DeleteTenantResponse.md)\>

Promise resolving to a confirmation message

## Throws

When OMNIBASE_AUTH_URL environment variable is not configured

## Throws

When the tenantId parameter is missing or empty

## Throws

When the user is not authenticated

## Throws

When the user is not an owner of the specified tenant

## Throws

When the tenant doesn't exist or is not accessible

## Throws

When the API request fails due to network issues

## Throws

When the server returns an error response (4xx, 5xx status codes)

## Example

Basic tenant deletion with confirmation:
```typescript
const tenantToDelete = 'tenant_abc123';

// Always confirm before deleting
const userConfirmed = confirm(
  'Are you sure you want to delete this tenant? This action cannot be undone.'
);

if (userConfirmed) {
  try {
    const result = await deleteTenant(tenantToDelete);
    console.log(result.data.message); // "Tenant deleted successfully"

    // Redirect user away from deleted tenant
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Failed to delete tenant:', error);
  }
}
```

## Since

1.0.0
