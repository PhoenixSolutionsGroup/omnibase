# Interface: TenantInvite

Defined in: tenants/create-invite.ts:65

Tenant invitation entity structure

Represents a pending invitation for a user to join a specific tenant
with a defined role. The invite contains a secure token that expires
after a certain time period and can only be used once.

## Example

```typescript
const invite: TenantInvite = {
  id: 'invite_abc123',
  tenant_id: 'tenant_xyz789',
  email: 'newuser@company.com',
  role: 'member',
  token: 'inv_secure_abc123xyz',
  inviter_id: 'user_owner123',
  expires_at: '2024-02-01T12:00:00Z',
  created_at: '2024-01-25T12:00:00Z',
  used_at: undefined // null until invite is accepted
};
```

## Since

1.0.0

## Properties

### created\_at

> **created\_at**: `string`

Defined in: tenants/create-invite.ts:81

ISO 8601 timestamp when the invitation was created

***

### email

> **email**: `string`

Defined in: tenants/create-invite.ts:71

Email address of the invited user

***

### expires\_at

> **expires\_at**: `string`

Defined in: tenants/create-invite.ts:79

ISO 8601 timestamp when the invitation expires

***

### id

> **id**: `string`

Defined in: tenants/create-invite.ts:67

Unique identifier for the invitation

***

### inviter\_id

> **inviter\_id**: `string`

Defined in: tenants/create-invite.ts:77

ID of the user who created this invitation

***

### role

> **role**: `string`

Defined in: tenants/create-invite.ts:73

Role the user will have in the tenant (e.g., 'owner', 'admin', 'member')

***

### tenant\_id

> **tenant\_id**: `string`

Defined in: tenants/create-invite.ts:69

ID of the tenant the user is being invited to

***

### token

> **token**: `string`

Defined in: tenants/create-invite.ts:75

Secure token used to accept the invitation

***

### used\_at?

> `optional` **used\_at**: `string`

Defined in: tenants/create-invite.ts:83

ISO 8601 timestamp when the invitation was accepted (null if unused)
