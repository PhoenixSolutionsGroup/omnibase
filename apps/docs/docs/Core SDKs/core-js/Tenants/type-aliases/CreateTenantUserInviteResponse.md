# Type Alias: CreateTenantUserInviteResponse

> **CreateTenantUserInviteResponse** = [`ApiResponse`](ApiResponse.md)\<\{ `invite`: [`TenantInvite`](../interfaces/TenantInvite.md); `message`: `string`; \}\>

Defined in: tenants/create-invite.ts:32

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

1.0.0
