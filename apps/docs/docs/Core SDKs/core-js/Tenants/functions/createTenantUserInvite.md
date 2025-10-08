# Function: createTenantUserInvite()

> **createTenantUserInvite**(`tenantId`, `inviteData`): `Promise`\<[`CreateTenantUserInviteResponse`](../type-aliases/CreateTenantUserInviteResponse.md)\>

Defined in: tenants/create-invite.ts:171

Creates a new user invitation for a specific tenant

Generates a secure invitation that allows a user to join the specified
tenant with the defined role. The invitation is sent to the provided
email address and includes a time-limited token for security.

The function creates the invitation record in the database and can
trigger email notifications (depending on server configuration).
The invitation expires after a predefined time period and can only
be used once.

Only existing tenant members with appropriate permissions can create
invitations. The inviter's authentication is validated via HTTP-only
cookies sent with the request.

## Parameters

### tenantId

`string`

Unique identifier of the tenant to invite the user to

### inviteData

[`CreateTenantUserInviteRequest`](../type-aliases/CreateTenantUserInviteRequest.md)

Configuration object for the invitation

## Returns

`Promise`\<[`CreateTenantUserInviteResponse`](../type-aliases/CreateTenantUserInviteResponse.md)\>

Promise resolving to the created invitation with secure token

## Throws

When OMNIBASE_API_URL environment variable is not configured

## Throws

When tenantId parameter is missing or empty

## Throws

When required fields (email, role) are missing or empty

## Throws

When the API request fails due to network issues

## Throws

When the server returns an error response (4xx, 5xx status codes)

## Examples

Basic invitation creation:
```typescript
const invite = await createTenantUserInvite('tenant_123', {
  email: 'colleague@company.com',
  role: 'member'
});

console.log(`Invite sent to: ${invite.data.invite.email}`);
// The invite token can be used to generate invitation links
const inviteLink = `https://app.com/accept-invite?token=${invite.data.invite.token}`;
```

Creating admin invitation:
```typescript
const adminInvite = await createTenantUserInvite('tenant_456', {
  email: 'admin@company.com',
  role: 'admin'
});

// Admin users get elevated permissions
console.log(`Admin invite created with ID: ${adminInvite.data.invite.id}`);
```

## Since

1.0.0
