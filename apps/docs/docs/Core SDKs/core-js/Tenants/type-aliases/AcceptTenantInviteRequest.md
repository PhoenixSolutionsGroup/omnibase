# Type Alias: AcceptTenantInviteRequest

> **AcceptTenantInviteRequest** = `object`

Defined in: tenants/accept-invite.ts:21

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

1.0.0

## Properties

### token

> **token**: `string`

Defined in: tenants/accept-invite.ts:23

Secure invitation token from the email invitation
