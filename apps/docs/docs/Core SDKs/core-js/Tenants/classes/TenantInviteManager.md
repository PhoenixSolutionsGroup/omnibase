# Class: TenantInviteManager

Defined in: [tenants/invites.ts:210](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L210)

Tenant invitation management handler

This class handles all tenant invitation operations including creating
invitations for new users and processing invitation acceptances. It provides
a secure, email-based invitation workflow with role-based access control
and token-based security.

The manager handles:
- Creating secure invitations with time-limited tokens
- Processing invitation acceptances with validation
- Email workflow integration (server-side)
- Role assignment and permission setup
- Security validation and anti-abuse measures

All invitation operations respect tenant permissions and ensure that only
authorized users can invite others to their tenants.

## Example

```typescript
const inviteManager = new TenantInviteManager(omnibaseClient);

// Create an invitation
const invite = await inviteManager.create({
  email: 'colleague@company.com',
  role: 'member',
  invite_url: 'https://yourapp.com/accept-invite'
});

// Accept an invitation (from the invited user's session)
const result = await inviteManager.accept('invite_token_xyz');
console.log(`Joined tenant: ${result.data.tenant_id}`);
```

## Since

0.6.0

## Tenant Invitations

### Constructor

> **new TenantInviteManager**(`omnibaseClient`): `TenantInviteManager`

Defined in: [tenants/invites.ts:221](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L221)

Creates a new TenantInviteManager instance

Initializes the manager with the provided Omnibase client for making
authenticated API requests to tenant invitation endpoints.

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured Omnibase client instance

#### Returns

`TenantInviteManager`

***

### accept()

> **accept**(`token`): `Promise`\<[`AcceptTenantInviteResponse`](../type-aliases/AcceptTenantInviteResponse.md)\>

Defined in: [tenants/invites.ts:276](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L276)

Accepts a tenant invitation using a secure token

Processes a tenant invitation by validating the provided token and
adding the authenticated user to the specified tenant. The invitation
token is consumed during this process and cannot be used again.

The function performs several validations:
- Verifies the token exists and is valid
- Checks that the invitation hasn't expired
- Ensures the invitation hasn't already been used
- Confirms the user is authenticated via session cookies

Upon successful acceptance, the user is granted access to the tenant
with the role specified in the original invitation. The invitation
record is marked as used and cannot be accepted again.

#### Parameters

##### token

`string`

The secure invitation token from the email invitation

#### Returns

`Promise`\<[`AcceptTenantInviteResponse`](../type-aliases/AcceptTenantInviteResponse.md)\>

Promise resolving to the tenant ID and success confirmation

#### Throws

When the token parameter is missing or empty

#### Throws

When the invitation token is invalid or expired

#### Throws

When the invitation has already been accepted

#### Throws

When the user is not authenticated

#### Throws

When the API request fails due to network issues

#### Throws

When the server returns an error response (4xx, 5xx status codes)

#### Example

```typescript
// Typically called from an invitation link like:
// https://app.com/accept-invite?token=inv_secure_token_abc123

const urlParams = new URLSearchParams(window.location.search);
const inviteToken = urlParams.get('token');

if (inviteToken) {
  try {
    const result = await inviteManager.accept(inviteToken);

    // Success - redirect to tenant dashboard
    console.log(`Successfully joined tenant: ${result.data.tenant_id}`);
    window.location.href = `/dashboard?tenant=${result.data.tenant_id}`;
  } catch (error) {
    console.error('Failed to accept invitation:', error.message);
  }
}
```

#### Since

0.6.0

***

### create()

> **create**(`inviteData`): `Promise`\<[`CreateTenantUserInviteResponse`](../type-aliases/CreateTenantUserInviteResponse.md)\>

Defined in: [tenants/invites.ts:357](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/invites.ts#L357)

Creates a new user invitation for the active tenant

Generates a secure invitation that allows a user to join the currently active
tenant with the defined role. The invitation is sent to the provided email address
and includes a time-limited token for security. The invite URL will be automatically
appended with ?token=XYZ when sent to the user.

The function creates the invitation record in the database and triggers an email
notification to the invited user. The invitation expires after 7 days and can only
be used once.

Only existing tenant members with appropriate permissions (invite_user permission)
can create invitations. The inviter's authentication and tenant context are validated
via HTTP-only cookies sent with the request.

#### Parameters

##### inviteData

[`CreateTenantUserInviteRequest`](../type-aliases/CreateTenantUserInviteRequest.md)

Configuration object for the invitation

#### Returns

`Promise`\<[`CreateTenantUserInviteResponse`](../type-aliases/CreateTenantUserInviteResponse.md)\>

Promise resolving to the created invitation with secure token

#### Throws

When required fields (email, role, invite_url) are missing or empty

#### Throws

When the user doesn't have permission to invite users to the tenant

#### Throws

When the API request fails due to network issues

#### Throws

When the server returns an error response (4xx, 5xx status codes)

#### Example

```typescript
const invite = await inviteManager.create({
  email: 'colleague@company.com',
  role: 'member',
  invite_url: 'https://yourapp.com/accept-invite'
});

console.log(`Invite sent to: ${invite.data.invite.email}`);
console.log(`Invite token: ${invite.data.invite.token}`);
```

#### Since

0.6.0
