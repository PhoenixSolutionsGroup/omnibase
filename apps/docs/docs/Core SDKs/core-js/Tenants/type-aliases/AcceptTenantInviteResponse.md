# Type Alias: AcceptTenantInviteResponse

> **AcceptTenantInviteResponse** = `ApiResponse`\<\{ `message`: `string`; `tenant_id`: `string`; `token`: `string`; \}\>

Defined in: [tenants/invites.ts:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L50)

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

0.6.0
