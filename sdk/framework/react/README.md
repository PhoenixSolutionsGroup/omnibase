# @omnibase/react

**React SDK for OmniBase authentication and session management**

The OmniBase React SDK provides React 19+ hooks, components, and context providers for integrating Ory Kratos authentication flows into your React applications. Built on top of `@omnibase/core-js`, it delivers type-safe session management, route protection, and seamless authentication state handling.

![npm version](https://img.shields.io/npm/v/@omnibase/react)
![License](https://img.shields.io/npm/l/@omnibase/react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features

| Feature | Description | Documentation |
|---------|-------------|---------------|
| Session Management | React hook for accessing user session with loading states | [Session Docs](https://docs.omnibase.dev) |
| Authentication Context | Provider component for app-wide authentication configuration | [Context Docs](https://docs.omnibase.dev) |
| Route Protection | Component-based client-side route guards | [Protection Docs](https://docs.omnibase.dev) |
| Direct Ory Access | Low-level hook for custom authentication flows | [API Reference](https://docs.omnibase.dev) |
| Type Safety | Full TypeScript definitions with comprehensive type coverage | [Types Reference](https://docs.omnibase.dev) |

## Quick Start

```tsx
import { AuthClientProvider, useSession } from '@omnibase/react';

function App() {
  return (
    <AuthClientProvider basePath="http://localhost:4000">
      <Dashboard />
    </AuthClientProvider>
  );
}

function Dashboard() {
  const { session, loading } = useSession();

  if (loading) return <div>Loading...</div>;
  if (!session || !session.active) return <div>Please log in</div>;

  return <div>Welcome, {session.identity.traits.email}!</div>;
}
```

## Installation

```bash
# npm
npm install @omnibase/react

# yarn
yarn add @omnibase/react

# pnpm
pnpm add @omnibase/react

# bun
bun add @omnibase/react
```

## Modules Overview

The SDK is organized into three main modules:

- **Context** - `AuthClientProvider` for app-wide authentication configuration and `useAuth()` for accessing the Ory Kratos client instance
- **Hooks** - `useSession()` for session state management with automatic loading and error handling
- **Components** - `ProtectedRoute` for client-side route protection with customizable redirect behavior

## Complete Workflow Example

```tsx
import { 
  AuthClientProvider, 
  useSession, 
  useAuth,
  ProtectedRoute 
} from '@omnibase/react';
import { useRouter } from 'next/navigation';

// 1. Wrap your app with the provider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthClientProvider basePath={process.env.NEXT_PUBLIC_API_URL!}>
      {children}
    </AuthClientProvider>
  );
}

// 2. Use session hook for authenticated components
function UserProfile() {
  const { session, loading } = useSession();

  if (loading) return <div>Loading profile...</div>;
  
  if (!session?.active) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>{session.identity.traits.email}</h1>
      <p>User ID: {session.identity.id}</p>
    </div>
  );
}

// 3. Protect routes with ProtectedRoute component
function DashboardPage() {
  const router = useRouter();

  return (
    <ProtectedRoute
      onInvalidSession={() => {
        router.push('/auth/login');
        return null;
      }}
    >
      <div>
        <h1>Protected Dashboard</h1>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}

// 4. Use direct Ory access for custom flows
function LogoutButton() {
  const ory = useAuth();

  const handleLogout = async () => {
    const { data } = await ory.createBrowserLogoutFlow();
    window.location.href = data.logout_url;
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

## Error Handling

The `useSession()` hook provides consistent error handling with loading states:

```tsx
function SecureComponent() {
  const { session, loading } = useSession();

  // Handle loading state
  if (loading) {
    return <div>Verifying session...</div>;
  }

  // Handle unauthenticated or inactive session
  if (!session || !session.active) {
    return <div>Access denied. Please log in.</div>;
  }

  // Session is valid and active
  return <div>Secure content for {session.identity.traits.email}</div>;
}
```

## Environment Configuration

```bash
# Required: OmniBase API endpoint
NEXT_PUBLIC_API_URL=https://your-api-endpoint.com

# Or pass directly to AuthClientProvider
# basePath="https://your-api-endpoint.com"
```

## Environment Support

| Environment | Status | Notes |
|-------------|--------|-------|
| React 19+ | ✅ | Required peer dependency |
| React 18 | ❌ | Not supported |
| TypeScript | ✅ | Full type definitions included |
| Next.js | ✅ | Works with App Router and Pages Router |
| Vite | ✅ | Full compatibility |
| Create React App | ✅ | Full compatibility |
| ESM/CJS | ✅ | Both module formats supported |

## Related Packages

- **[@omnibase/core-js](https://www.npmjs.com/package/@omnibase/core-js)** - Core SDK with all API methods for authentication, tenants, and database operations
- **[@omnibase/shadcn](https://www.npmjs.com/package/@omnibase/shadcn)** - Pre-built authentication UI components with shadcn/ui integration
- **[@omnibase/nextjs](https://www.npmjs.com/package/@omnibase/nextjs)** - Next.js optimized SDK with middleware and server component support

## API Reference

For detailed API documentation including all hooks, components, and types, visit the [full API reference](https://docs.omnibase.dev).

## License

MIT
