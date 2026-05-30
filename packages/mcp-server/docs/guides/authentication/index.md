---
title: Authentication Overview
description: Learn how OmniBase Auth handles user authentication, sessions, and identity management
---

# Authentication

OmniBase Auth provides a complete authentication system with support for email/password login, social OAuth providers, multi-factor authentication, and secure session management.

## Key Features

- **[Session Management](/docs/guides/authentication/sessions)**
    Server-side session handling with automatic cookie management
- **[Authentication Flows](/docs/guides/authentication/flows)**
    Pre-built forms for login, registration, recovery, and verification
- **[Route Protection](/docs/guides/authentication/middleware)**
    Middleware for protecting routes and managing tenant context
- **[Account Settings](/docs/guides/authentication/flows#settings-flow)**
    User profile management, password changes, and MFA setup

## Supported Authentication Methods

| Method | Description |
|--------|-------------|
| **Email/Password** | Traditional username and password authentication |
| **Social OAuth** | Google, GitHub, and other OAuth providers |
| **Magic Links** | Passwordless email-based login |
| **TOTP** | Time-based one-time passwords (Google Authenticator) |
| **WebAuthn** | Security keys and biometric authentication |
| **Passkeys** | Modern passwordless authentication |

## Quick Start

Here's how to add authentication to a Next.js application in three steps:

### Install the SDKs

```bash
bun add @omnibase/nextjs @omnibase/shadcn
```

### Create the Auth Route

Create a catch-all route at `app/auth/[...flow]/page.tsx`:

```tsx
import { FlowRouter } from '@omnibase/nextjs/auth';
import {
  LoginForm,
  RegistrationForm,
  RecoveryForm,
  VerificationForm,
  SettingsForm,
  ErrorForm,
} from '@omnibase/shadcn';

export default function AuthPage({ params, searchParams }: any) {
  return (
    <div className="mt-[20vh]">
      <FlowRouter
        params={params}
        searchParams={searchParams}
        url="/auth"
        returnTo="/"
        flowMap={{
          login: (flow) => (
            <LoginForm flow={flow} register_url="/auth/registration" />
          ),
          registration: (flow) => (
            <RegistrationForm flow={flow} login_url="/auth/login" />
          ),
          recovery: (flow) => <RecoveryForm flow={flow} />,
          verification: (flow) => <VerificationForm flow={flow} />,
          settings: (flow) => <SettingsForm flow={flow} />,
          error: (error) => <ErrorForm error={error} login_url="/auth/login" />,
        }}
        onNotFound={<div>Page not found</div>}
      />
    </div>
  );
}
```

### Add the Session Provider

Wrap your app with the `SessionProvider` in `app/layout.tsx`:

```tsx
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

## Middleware Setup

Create a `middleware.ts` file in your project root to handle authentication and tenant checking:

```typescript title="middleware.ts"
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export const middleware = createOmniBaseMiddleware(
  process.env.OMNIBASE_API_URL!,
  {
    tenant_check: true,
    tenant_check_paths: ['/'],
    tenant_check_redirect_url: '/auth/onboarding',
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tenant_check` | `boolean` | `true` | Enable tenant membership validation |
| `tenant_check_paths` | `string[]` | `["/"]` | Paths that require tenant membership (supports wildcards like `/api/*`) |
| `tenant_check_redirect_url` | `string` | `"/auth/onboarding"` | URL to redirect users without a tenant |

> **Note:**
See the [Middleware Guide](/guides/authentication/middleware) for detailed configuration options and patterns.

## Project Structure

A typical Next.js project with OmniBase Auth looks like this:

- `app/`
- `auth/`
- `[...flow]/page.tsx`
- `api/`
- `auth/`
- `logout/route.ts`
- `layout.tsx`
- `page.tsx`
- `middleware.ts`

## Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  OmniBase    │────▶│   Session   │
│   Request   │     │  Auth        │     │   Cookie    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Identity   │
                    │   Store      │
                    └──────────────┘
```

1. User submits credentials via a form (login, registration, etc.)
2. OmniBase Auth validates the credentials and creates a session
3. A secure HTTP-only cookie is set in the browser
4. Subsequent requests include the cookie for authentication

## SDK Options

OmniBase provides SDKs for different use cases:

**Next.js:**

**Best for:** Server-side rendering, App Router, full-stack applications

```tsx
import {
  SessionProvider,
  getServerSession,
  protectedRoute,
  FlowRouter
} from '@omnibase/nextjs/auth';
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
```

Features:
- Server Components support
- Automatic session hydration
- Built-in middleware for route protection
- Seamless cookie handling

**React:**

**Best for:** Client-side applications, SPAs, custom backends

```tsx
import {
  AuthClientProvider,
  useSession,
  useAuth
} from '@omnibase/react';
```

Features:
- React Context for session state
- `useSession` hook for accessing user data
- Client-side session management
- Works with any React framework

**Core API:**

**Best for:** Custom implementations, non-React frameworks, server-to-server

```typescript
import { Configuration, V1AuthApi } from '@omnibase/core-js';

const config = new Configuration({
  basePath: process.env.OMNIBASE_API_URL,
  headers: { 'X-Service-Key': process.env.SERVICE_KEY },
});

const authApi = new V1AuthApi(config);
```

Features:
- Direct API access
- Server-to-server authentication
- Programmatic user creation
- Full control over authentication flow

## UI Components

The `@omnibase/shadcn` package provides pre-built, customizable authentication forms:

| Component | Purpose |
|-----------|---------|
| `LoginForm` | Email/password login with optional OAuth |
| `RegistrationForm` | New user signup with identity traits |
| `RecoveryForm` | Password reset via email |
| `VerificationForm` | Email verification with 6-digit code |
| `SettingsForm` | Profile management, password change, MFA |
| `ErrorForm` | Display authentication errors gracefully |
| `TenantCreator` | Onboarding flow for creating/joining organizations |

> **Note:**
All components are built with shadcn/ui and can be customized via CSS variables or by modifying the source.

## Server-Side User Creation

For backend operations (admin scripts, migrations, webhooks), create users directly via the API:

```typescript
import { Configuration, V1AuthApi } from '@omnibase/core-js';

const config = new Configuration({
  basePath: process.env.OMNIBASE_API_URL,
  headers: { 'X-Service-Key': process.env.OMNIBASE_SERVICE_KEY },
});

const authApi = new V1AuthApi(config);

// Create a new user programmatically
const { data } = await authApi.createUser({
  createUserRequest: {
    email: 'user@example.com',
    password: 'secure-password-123',
    name: { first: 'John', last: 'Doe' },
  },
});

console.log('Created user:', data.data.id);
```

## What's Next?

- **[Sessions](/docs/guides/authentication/sessions)**
    Deep dive into session management and providers
- **[Authentication Flows](/docs/guides/authentication/flows)**
    Implement login, registration, and recovery flows
- **[Middleware](/docs/guides/authentication/middleware)**
    Protect routes and manage tenant context
