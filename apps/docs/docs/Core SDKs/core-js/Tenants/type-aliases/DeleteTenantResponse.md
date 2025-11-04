# Type Alias: DeleteTenantResponse

> **DeleteTenantResponse** = `ApiResponse`\<\{ `message`: `string`; \}\>

Defined in: [tenants/management.ts:59](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L59)

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

0.6.0
