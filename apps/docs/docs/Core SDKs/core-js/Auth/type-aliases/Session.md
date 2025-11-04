# Type Alias: Session

> **Session** = `object`

Defined in: [auth/types.ts:360](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L360)

User session object representing an authenticated user's session state

A session contains all information about a user's authentication state,
including when they authenticated, what methods were used, device information,
and the associated identity. Sessions have expiration times and can be
invalidated when users log out or when security policies require it.

Sessions are central to maintaining authentication state across requests
and provide the foundation for authorization decisions throughout your
application.

## Examples

Checking session validity:
```typescript
function isSessionValid(session: Session): boolean {
  if (!session.active) {
    return false;
  }

  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    return false;
  }

  return true;
}
```

Extracting user information:
```typescript
function getUserInfo(session: Session) {
  return {
    id: session.identity?.id,
    email: session.identity?.traits?.email,
    name: session.identity?.traits?.name,
    isVerified: session.identity?.verifiable_addresses?.some(
      addr => addr.verified
    ) || false
  };
}
```

Session security analysis:
```typescript
function analyzeSessionSecurity(session: Session) {
  const authMethods = session.authentication_methods || [];
  const hasMFA = authMethods.length > 1;
  const recentAuth = session.authenticated_at &&
    new Date(session.authenticated_at) > new Date(Date.now() - 3600000); // 1 hour

  return {
    hasMFA,
    recentAuth,
    assuranceLevel: session.authenticator_assurance_level,
    deviceCount: session.devices?.length || 0
  };
}
```

## Since

0.1.0

## Properties

### active?

> `optional` **active**: `boolean`

Defined in: [auth/types.ts:370](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L370)

Session active state

Indicates whether the session is currently active and valid for
authentication purposes. When false, the session should be treated
as invalid regardless of expiration time.

#### Default Value

```ts
true
```

***

### authenticated\_at?

> `optional` **authenticated\_at**: `Date`

Defined in: [auth/types.ts:382](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L382)

Session authentication timestamp

The exact time when this session was authenticated. For multi-factor
authentication scenarios, this represents when the last factor was
successfully verified (e.g., TOTP code completion, biometric verification).

This timestamp is crucial for implementing security policies that require
recent authentication for sensitive operations.

***

### authentication\_methods?

> `optional` **authentication\_methods**: `SessionAuthenticationMethod`[]

Defined in: [auth/types.ts:394](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L394)

Authentication methods used for this session

A comprehensive list of all authentication methods used to establish
this session. This includes passwords, social logins, multi-factor
authentication tokens, and any other verification methods.

Useful for implementing step-up authentication or authorization decisions
based on authentication strength.

***

### authenticator\_assurance\_level?

> `optional` **authenticator\_assurance\_level**: `AuthenticatorAssuranceLevel`

Defined in: [auth/types.ts:407](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L407)

Authenticator assurance level

Indicates the confidence level in the user's identity based on the
authentication methods used. Higher assurance levels typically require
multiple factors or stronger authentication methods.

Common levels:
- `aal1`: Single-factor authentication (password, social login)
- `aal2`: Multi-factor authentication (password + TOTP, biometrics)

***

### devices?

> `optional` **devices**: `SessionDevice`[]

Defined in: [auth/types.ts:420](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L420)

Session device history

Complete history of all devices and endpoints where this session
has been used. This information is valuable for security monitoring,
anomaly detection, and providing users with visibility into their
account access patterns.

Each device entry includes IP address, user agent, location data,
and timestamp information for comprehensive session tracking.

***

### expires\_at?

> `optional` **expires\_at**: `Date`

Defined in: [auth/types.ts:432](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L432)

Session expiration timestamp

The exact time when this session expires and becomes invalid.
After this time, the session should not be accepted for authentication
and the user should be required to log in again.

Session expiration can be extended through refresh tokens or
re-authentication flows depending on your application's security policy.

***

### id

> **id**: `string`

Defined in: [auth/types.ts:441](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L441)

Unique session identifier

A unique identifier for this session that can be used for session
management operations such as invalidation, refresh, or audit logging.
This ID is typically used in session storage and tracking systems.

***

### identity?

> `optional` **identity**: `Identity`

Defined in: [auth/types.ts:454](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L454)

Associated user identity

The complete identity object of the authenticated user, containing
all user profile information, traits, verifiable addresses, and
recovery addresses. This is the primary source of user information
for the session.

The identity structure is defined by your identity schema and may
include custom fields specific to your application's user model.

***

### issued\_at?

> `optional` **issued\_at**: `Date`

Defined in: [auth/types.ts:467](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L467)

Session issuance timestamp

The time when this session was initially created and issued.
This is typically equal to or very close to `authenticated_at`,
but may differ in cases where session creation and authentication
are separate operations.

Useful for implementing session age limits and security policies
that consider the total session lifetime.

***

### tokenized?

> `optional` **tokenized**: `string`

Defined in: [auth/types.ts:490](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L490)

Tokenized session representation

A tokenized version of the session, typically in JWT format, that
can be used for stateless authentication scenarios. This field is
only populated when specifically requested through the `tokenize_as`
query parameter during session retrieval.

The tokenized session contains essential session information in a
cryptographically signed format, allowing for distributed authentication
without requiring centralized session storage lookups.

#### Example

Using tokenized session:
```typescript
if (session.tokenized) {
  // Use JWT token for API authentication
  localStorage.setItem('auth_token', session.tokenized);
}
```
