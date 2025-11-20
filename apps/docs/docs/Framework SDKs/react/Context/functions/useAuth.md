# Function: useAuth()

> **useAuth**(): `FrontendApi`

Defined in: context/provider.tsx:113

Hook to access the Ory authentication client

This hook provides access to the Ory Kratos FrontendApi client instance
configured by the [`AuthClientProvider`](provider.tsx:80). It must be used within components
that are descendants of the provider.

The returned client can be used to make direct calls to the Ory Kratos API
for advanced authentication operations. Most common use cases are covered by
the [`useSession()`](../hooks/use-session.ts:84) hook, but this hook is useful for custom
authentication flows or accessing lower-level Ory APIs.

## Returns

`FrontendApi`

Configured Ory FrontendApi client instance

## Throws

When called outside of [`AuthClientProvider`](provider.tsx:80) context

## Example

```tsx
import { useAuth } from '@omnibase/react';

function LogoutButton() {
  const ory = useAuth();

  const handleLogout = async () => {
    const { data } = await ory.createBrowserLogoutFlow();
    window.location.href = data.logout_url;
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

## Since

0.2.0
