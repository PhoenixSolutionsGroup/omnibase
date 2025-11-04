# Type Alias: TenantInvite

> **TenantInvite** = `object`

Defined in: [tenants/invites.ts:121](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L121)

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

0.6.0

## Properties

### created\_at

> **created\_at**: `string`

Defined in: [tenants/invites.ts:137](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L137)

ISO 8601 timestamp when the invitation was created

***

### email

> **email**: `string`

Defined in: [tenants/invites.ts:127](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L127)

Email address of the invited user

***

### expires\_at

> **expires\_at**: `string`

Defined in: [tenants/invites.ts:135](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L135)

ISO 8601 timestamp when the invitation expires

***

### id

> **id**: `string`

Defined in: [tenants/invites.ts:123](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L123)

Unique identifier for the invitation

***

### inviter\_id

> **inviter\_id**: `string`

Defined in: [tenants/invites.ts:133](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L133)

ID of the user who created this invitation

***

### role

> **role**: `string`

Defined in: [tenants/invites.ts:129](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L129)

Role the user will have in the tenant (e.g., 'owner', 'admin', 'member')

***

### tenant\_id

> **tenant\_id**: `string`

Defined in: [tenants/invites.ts:125](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L125)

ID of the tenant the user is being invited to

***

### token

> **token**: `string`

Defined in: [tenants/invites.ts:131](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L131)

Secure token used to accept the invitation

***

### used\_at?

> `optional` **used\_at**: `string`

Defined in: [tenants/invites.ts:139](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L139)

ISO 8601 timestamp when the invitation was accepted (null if unused)
