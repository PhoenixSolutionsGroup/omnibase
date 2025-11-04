# Function: AuthClientProvider()

> **AuthClientProvider**(`props`): `Element`

Defined in: [context/provider.tsx:64](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/react/src/context/provider.tsx#L64)

Authentication provider component for React applications

This provider wraps your React application and provides authentication context
to all child components. It initializes the Ory Kratos client with the specified
base path and enables credential-based authentication.

This provider is required when using the [`useSession()`](../hooks/use-session.ts:84) hook or
[`ProtectedRoute`](../components/protected-route.tsx:51) component. It configures the Ory Kratos FrontendApi
client with automatic credential handling for cookie-based sessions.

## Parameters

### props

[`AuthProviderProps`](../type-aliases/AuthProviderProps.md)

Configuration object for the provider

## Returns

`Element`

Provider component wrapping the children with authentication context

## Example

```tsx
import { AuthClientProvider } from '@omnibase/react';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthClientProvider basePath={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}>
      {children}
    </AuthClientProvider>
  );
}
```

## Since

0.2.0
