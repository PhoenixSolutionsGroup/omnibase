# Type Alias: CreateTenantResponse

> **CreateTenantResponse** = `ApiResponse`\<\{ `message`: `string`; `tenant`: [`Tenant`](Tenant.md); `token`: `string`; \}\>

Defined in: [tenants/management.ts:92](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L92)

Response structure for tenant creation operations

Contains the newly created tenant information along with an authentication
token that provides Row-Level Security (RLS) access to the tenant's data.
The token should be stored securely and used for subsequent API calls
that require tenant-specific access.

## Example

```typescript
const response: CreateTenantResponse = {
  data: {
    tenant: {
      id: 'tenant_123',
      name: 'My Company',
      stripe_customer_id: 'cus_abc123'
    },
    message: 'Tenant created successfully',
    token: 'eyJhbGciOiJIUzI1NiIs...'
  },
  status: 201
};
```

## Since

0.6.0
