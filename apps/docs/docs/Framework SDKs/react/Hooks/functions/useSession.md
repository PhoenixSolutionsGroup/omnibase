# Function: useSession()

> **useSession**(): `object`

Defined in: [hooks/use-session.ts:48](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/react/src/hooks/use-session.ts#L48)

React hook for accessing user session information

This hook retrieves the current authenticated user's session data from the
Ory Kratos authentication service. It automatically fetches the session on
component mount and provides loading states for displaying appropriate UI.

The hook must be used within a component that is wrapped by the
[`AuthClientProvider`](../context/provider.tsx:80). It handles session retrieval, error cases
(setting session to null when unauthenticated), and provides a loading state for better UX.

## Returns

`object`

Object containing session data and loading state

### loading

> **loading**: `boolean`

### session

> **session**: `null` \| `Session`

## Example

```tsx
import { useSession } from '@omnibase/react';

function UserProfile() {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session || !session.active) {
    return <div>Please log in to continue</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.identity.traits.email}!</h1>
      <p>User ID: {session.identity.id}</p>
    </div>
  );
}
```

## Since

0.2.0
