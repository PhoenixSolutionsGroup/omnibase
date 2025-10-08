# Type Alias: SwitchActiveTenantResponse

> **SwitchActiveTenantResponse** = [`ApiResponse`](ApiResponse.md)\<\{ `message`: `string`; `token`: `string`; \}\>

Defined in: tenants/switch-tenant.ts:30

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

1.0.0
