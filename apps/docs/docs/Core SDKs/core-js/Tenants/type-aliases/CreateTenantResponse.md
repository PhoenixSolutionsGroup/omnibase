# Type Alias: CreateTenantResponse

> **CreateTenantResponse** = [`ApiResponse`](ApiResponse.md)\<\{ `message`: `string`; `tenant`: [`Tenant`](Tenant.md); `token`: `string`; \}\>

Defined in: tenants/create-tenant.ts:31

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

1.0.0
