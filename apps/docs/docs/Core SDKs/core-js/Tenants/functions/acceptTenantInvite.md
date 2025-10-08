# Function: acceptTenantInvite()

> **acceptTenantInvite**(`token`): `Promise`\<[`AcceptTenantInviteResponse`](../type-aliases/AcceptTenantInviteResponse.md)\>

Defined in: tenants/accept-invite.ts:124

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

## Parameters

### token

`string`

The secure invitation token from the email invitation

## Returns

`Promise`\<[`AcceptTenantInviteResponse`](../type-aliases/AcceptTenantInviteResponse.md)\>

Promise resolving to the tenant ID and success confirmation

## Throws

When OMNIBASE_API_URL environment variable is not configured

## Throws

When the token parameter is missing or empty

## Throws

When the invitation token is invalid or expired

## Throws

When the invitation has already been accepted

## Throws

When the user is not authenticated

## Throws

When the API request fails due to network issues

## Throws

When the server returns an error response (4xx, 5xx status codes)

## Examples

Basic invitation acceptance:
```typescript
const result = await acceptTenantInvite('inv_secure_token_abc123');

console.log(`Successfully joined tenant: ${result.data.tenant_id}`);
// User can now access tenant resources
await switchActiveTenant(result.data.tenant_id);
```

Handling the invitation flow:
```typescript
// Typically called from an invitation link like:
// https://app.com/accept-invite?token=inv_secure_token_abc123

const urlParams = new URLSearchParams(window.location.search);
const inviteToken = urlParams.get('token');

if (inviteToken) {
  try {
    const result = await acceptTenantInvite(inviteToken);

    // Success - redirect to tenant dashboard
    window.location.href = `/dashboard?tenant=${result.data.tenant_id}`;
  } catch (error) {
    console.error('Failed to accept invitation:', error.message);
    // Show error to user
  }
}
```

## Since

1.0.0
