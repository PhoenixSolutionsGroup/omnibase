# Type Alias: DeleteTenantResponse

> **DeleteTenantResponse** = [`ApiResponse`](ApiResponse.md)\<\{ `message`: `string`; \}\>

Defined in: tenants/delete-tenant.ts:24

Response structure for deleting a tenant

Contains a confirmation message indicating successful tenant deletion.
This response is only returned after the tenant and all associated data
have been permanently removed from the system.

## Example

```typescript
const response: DeleteTenantResponse = {
  data: {
    message: 'Tenant deleted successfully'
  },
  status: 200
};
```

## Since

1.0.0
