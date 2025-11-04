# Type Alias: LogoutFlow

> **LogoutFlow** = `Logout`

Defined in: [auth/types.ts:82](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L82)

Logout flow for terminating user sessions

The logout flow ensures that user sessions are properly terminated on the
authentication server. This flow handles both cookie-based and token-based
session termination, providing secure logout functionality across different
authentication methods.

## Example

Initiating logout flow:
```typescript
// Browser-based logout
window.location.href = logoutFlow.logout_url;

// Or for SPA/API-based logout
await fetch(logoutFlow.logout_url, {
  method: 'GET',
  credentials: 'include'
});
```

## Since

0.1.0
