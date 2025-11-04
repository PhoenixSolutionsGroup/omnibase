# Type Alias: AcceptTenantInviteRequest

> **AcceptTenantInviteRequest** = `object`

Defined in: [tenants/invites.ts:22](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L22)

Request data for accepting a tenant invitation

Contains the secure token that was provided in the invitation.
This token is validated server-side to ensure the invitation
is legitimate, not expired, and hasn't been used before.

## Example

```typescript
const acceptData: AcceptTenantInviteRequest = {
  token: 'inv_secure_token_abc123xyz'
};
```

## Since

0.6.0

## Properties

### token

> **token**: `string`

Defined in: [tenants/invites.ts:24](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L24)

Secure invitation token from the email invitation
