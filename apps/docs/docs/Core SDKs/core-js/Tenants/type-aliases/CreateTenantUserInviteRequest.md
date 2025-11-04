# Type Alias: CreateTenantUserInviteRequest

> **CreateTenantUserInviteRequest** = `object`

Defined in: [tenants/invites.ts:163](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L163)

Required data for creating a tenant user invitation

Specifies the email address of the user to invite, their intended
role within the tenant, and the invitation URL that will be sent in the email.
The role determines what permissions the user will have once they accept the invitation.
The invite_url will be automatically appended with ?token=XYZ when sent to the user.

## Example

```typescript
const inviteData: CreateTenantUserInviteRequest = {
  email: 'developer@company.com',
  role: 'admin',
  invite_url: 'https://yourapp.com/accept-invite'
};
```

## Since

0.6.0

## Properties

### email

> **email**: `string`

Defined in: [tenants/invites.ts:165](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L165)

Email address of the user to invite

***

### invite\_url

> **invite\_url**: `string`

Defined in: [tenants/invites.ts:169](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L169)

Invite URL - the link that will be sent to the user's email, automatically suffixed with ?token=XYZ

***

### role

> **role**: `string`

Defined in: [tenants/invites.ts:167](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L167)

Role the invited user will have in the tenant
