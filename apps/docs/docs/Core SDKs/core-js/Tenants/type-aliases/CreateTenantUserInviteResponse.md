# Type Alias: CreateTenantUserInviteResponse

> **CreateTenantUserInviteResponse** = `ApiResponse`\<\{ `invite`: [`TenantInvite`](TenantInvite.md); `message`: `string`; \}\>

Defined in: [tenants/invites.ts:88](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L88)

Response structure for tenant user invite creation

Contains the newly created invite information including the secure token
that will be sent to the invitee. The invite has an expiration time and
can only be used once to join the specified tenant.

## Example

```typescript
const response: CreateTenantUserInviteResponse = {
  data: {
    invite: {
      id: 'invite_123',
      tenant_id: 'tenant_abc',
      email: 'colleague@company.com',
      role: 'member',
      token: 'inv_secure_token_xyz',
      expires_at: '2024-02-15T10:30:00Z'
    },
    message: 'Invite created successfully'
  },
  status: 201
};
```

## Since

0.6.0
