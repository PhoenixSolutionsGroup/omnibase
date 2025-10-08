# Type Alias: CreateTenantUserInviteRequest

> **CreateTenantUserInviteRequest** = `object`

Defined in: tenants/create-invite.ts:105

Required data for creating a tenant user invitation

Specifies the email address of the user to invite and their intended
role within the tenant. The role determines what permissions the user
will have once they accept the invitation.

## Example

```typescript
const inviteData: CreateTenantUserInviteRequest = {
  email: 'developer@company.com',
  role: 'admin'
};
```

## Since

1.0.0

## Properties

### email

> **email**: `string`

Defined in: tenants/create-invite.ts:107

Email address of the user to invite

***

### role

> **role**: `string`

Defined in: tenants/create-invite.ts:109

Role the invited user will have in the tenant
