# Type Alias: AcceptTenantInviteResponse

> **AcceptTenantInviteResponse** = [`ApiResponse`](ApiResponse.md)\<\{ `message`: `string`; `tenant_id`: `string`; `token`: `string`; \}\>

Defined in: tenants/accept-invite.ts:49

Response structure for accepting a tenant invitation

Contains the ID of the tenant that the user has successfully joined
along with a confirmation message. After accepting an invitation,
the user becomes a member of the tenant with the role specified
in the original invitation.

## Example

```typescript
const response: AcceptTenantInviteResponse = {
  data: {
    tenant_id: 'tenant_abc123',
    message: 'Successfully joined tenant'
  },
  status: 200
};
```

## Since

1.0.0
