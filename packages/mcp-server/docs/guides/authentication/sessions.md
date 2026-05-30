---
title: Session Management
description: Managing user sessions in OmniBase applications
---

# Session Management

Sessions in OmniBase track authenticated users across requests. This guide covers how to set up session providers, retrieve session data, and protect routes.

## Session Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│  Cookie: ory_kratos_session=<session_token>                     │
│  Cookie: omnibase_postgrest_jwt=<tenant_jwt>                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OmniBase API                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Validates session cookie                                     │
│  2. Extracts user identity                                       │
│  3. Determines active tenant                                     │
│  4. Sets database context for RLS                                │
└─────────────────────────────────────────────────────────────────┘
```

## Session Provider (Next.js)

The `SessionProvider` is an async server component that fetches the session and provides it to the component tree.

### Setup

Add the provider to your root layout:

```tsx title="app/layout.tsx"
import { SessionProvider } from '@omnibase/nextjs/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

> **Note:**
`SessionProvider` is a server component. It fetches the session on the server and hydrates the client with the session data.

## Getting Session Data

### Server Components (Recommended)

Use `getServerSession()` in server components for optimal performance:

```tsx title="app/dashboard/page.tsx"
import { getServerSession } from '@omnibase/nextjs/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || !session.active) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>Welcome, {session.identity.traits.email}!</h1>
      <p>User ID: {session.identity.id}</p>
      <p>Session expires: {new Date(session.expires_at).toLocaleString()}</p>
    </div>
  );
}
```

### Protected Route Helper

For pages that always require authentication, use `protectedRoute()`:

```tsx title="app/settings/page.tsx"
import { protectedRoute } from '@omnibase/nextjs/auth';

export default async function SettingsPage() {
  // Automatically redirects to /auth/login if not authenticated
  const session = await protectedRoute('/auth/login');

  return (
    <div>
      <h1>Settings for {session.identity.traits.name.first}</h1>
      {/* Settings form */}
    </div>
  );
}
```

### Client Components (React)

For client-side session access in React applications:

**React SDK:**

```tsx title="components/UserProfile.tsx"
'use client';

import { useSession } from '@omnibase/react';

export function UserProfile() {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session || !session.active) {
    return <div>Please log in to continue</div>;
  }

  return (
    <div>
      <img src={session.identity.traits.picture} alt="Profile" />
      <h2>{session.identity.traits.email}</h2>
      <p>Member since: {new Date(session.identity.created_at).toLocaleDateString()}</p>
    </div>
  );
}
```

**Next.js (via context):**

When using `SessionProvider`, you can access session data via the Ory Elements session hook:

```tsx title="components/UserMenu.tsx"
'use client';

import { useSession } from '@ory/elements-react/client';

export function UserMenu() {
  const session = useSession();

  if (!session) {
    return <a href="/auth/login">Sign In</a>;
  }

  return (
    <div>
      <span>{session.identity?.traits?.email}</span>
      <a href="/api/auth/logout">Sign Out</a>
    </div>
  );
}
```

## Implementing Logout

### API Route Method (Recommended)

Create an API route that handles the logout flow:

```typescript title="app/api/auth/logout/route.ts"
import { getLogoutFlow } from '@omnibase/nextjs/auth';

export async function POST() {
  const flow = await getLogoutFlow({
    returnTo: '/auth/login',
  });

  if (!flow) {
    return new Response('Not logged in', { status: 401 });
  }

  return await flow.action();
}
```

Then call it from a form or button:

```tsx title="components/LogoutButton.tsx"
export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

### Client-Side Method (React)

For React applications without Next.js:

```tsx title="components/LogoutButton.tsx"
'use client';

import { useAuth } from '@omnibase/react';

export function LogoutButton() {
  const auth = useAuth();

  const handleLogout = async () => {
    const { data } = await auth.createBrowserLogoutFlow();
    window.location.href = data.logout_url;
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

## Session Cookies

OmniBase uses these cookies for authentication:

| Cookie | Purpose |
|--------|---------|
| `ory_kratos_session` | Main session token from OmniBase Auth |
| `ory_kratos_continuity` | Flow continuity for multi-step auth flows |
| `omnibase_postgrest_jwt` | JWT for database access with tenant context |

> **Note:**
All cookies are HTTP-only and secure. Never attempt to read or modify them via JavaScript.

## Session with Tenant Context

When a user has an active tenant, the session includes tenant information:

```tsx title="app/dashboard/page.tsx"
import { getServerSession } from '@omnibase/nextjs/auth';
import { Configuration, V1AuthApi } from '@omnibase/core-js';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.active) {
    redirect('/auth/login');
  }

  // Get the active tenant for this user
  const config = new Configuration({
    basePath: process.env.OMNIBASE_API_URL,
  });
  const authApi = new V1AuthApi(config);

  const { data: activeTenant } = await authApi.getActiveTenant();

  return (
    <div>
      <h1>Dashboard</h1>
      {activeTenant.data?.tenant ? (
        <p>Organization: {activeTenant.data.tenant.name}</p>
      ) : (
        <a href="/auth/onboarding">Create or join an organization</a>
      )}
    </div>
  );
}
```

## Session Validation Flow

### Request Arrives

Browser sends request with session cookie to your Next.js app.

### Middleware Validates

`createOmniBaseMiddleware` checks the session and tenant membership.

### Session Retrieved

`getServerSession()` or `protectedRoute()` fetches full session data.

### Component Renders

Your page/component receives the authenticated user's session.

## Error Handling

Handle session errors gracefully:

```tsx
import { getServerSession } from '@omnibase/nextjs/auth';

export default async function ProfilePage() {
  try {
    const session = await getServerSession();

    if (!session) {
      // No session - user is not logged in
      return <LoginPrompt />;
    }

    if (!session.active) {
      // Session expired
      return <SessionExpiredMessage />;
    }

    return <ProfileContent session={session} />;
  } catch (error) {
    // Auth service unavailable
    console.error('Failed to fetch session:', error);
    return <ServiceUnavailableMessage />;
  }
}
```

## Best Practices

1. **Prefer server-side session checks** - Use `getServerSession()` in server components for security and performance.

2. **Use `protectedRoute()` for authenticated-only pages** - It handles redirects automatically.

3. **Don't store sensitive data in session traits** - Traits are visible to the client.

4. **Handle loading states** - Always show loading UI while `useSession()` is fetching.

5. **Implement proper logout** - Clear all auth cookies and redirect to login.

## Related

- [Authentication Flows](/guides/authentication/flows) - Implement login, registration, and recovery
- [Middleware](/guides/authentication/middleware) - Protect routes with middleware
- [Multi-Tenancy](/guides/multi-tenancy) - How sessions work with tenants
