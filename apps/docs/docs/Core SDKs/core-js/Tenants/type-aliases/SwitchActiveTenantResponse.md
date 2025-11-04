# Type Alias: SwitchActiveTenantResponse

> **SwitchActiveTenantResponse** = `ApiResponse`\<\{ `message`: `string`; `token`: `string`; \}\>

Defined in: [tenants/management.ts:31](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L31)

Response structure for switching the active tenant

Contains a new JWT token that includes the updated tenant context
and a confirmation message. The new token should replace the previous
token for all subsequent API calls to ensure requests are made within
the context of the newly active tenant.

The token includes updated tenant-specific claims and permissions,
ensuring that row-level security policies are enforced correctly
for the new active tenant context.

## Example

```typescript
const response: SwitchActiveTenantResponse = {
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    message: 'Active tenant switched successfully'
  },
  status: 200
};
```

## Since

0.6.0
