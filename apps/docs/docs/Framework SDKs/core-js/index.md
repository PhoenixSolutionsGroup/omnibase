# @omnibase/nextjs

**Complete authentication and multi-tenant solution for Next.js applications**

The Omnibase Next.js SDK provides seamless integration of Ory Kratos authentication flows and multi-tenant management for Next.js applications. Built with TypeScript support, React Server Components, and modern Next.js patterns, it offers a production-ready solution for complex authentication scenarios.

![npm version](https://img.shields.io/npm/v/@omnibase/nextjs)
![License](https://img.shields.io/npm/l/@omnibase/nextjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features

| Feature | Description | Documentation |
|---------|-------------|---------------|
| Authentication Flows | Complete login, registration, recovery, settings, and verification flows | [Auth Docs](#authentication) |
| Session Management | Server-side session handling with React Context integration | [Session Docs](#authentication) |
| Flow Router | Automatic routing and handling of authentication flows | [Flow Router](#flow-router) |
| Multi-tenant Support | Organization management with tenant switching and invitations | [Tenant Docs](#multi-tenant) |
| Middleware Integration | Next.js middleware for route protection and session management | [Middleware Docs](#middleware) |
| Server Actions | Next.js server actions for seamless data mutations | [Server Actions](#server-actions) |

## Quick Start

```tsx
// app/layout.tsx
import { SessionProvider } from '@omnibase/nextjs/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

// middleware.ts (REQUIRED for authentication)
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export default createOmniBaseMiddleware();

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

// app/auth/[...flow]/page.tsx
import { FlowRouter } from '@omnibase/nextjs/auth';

export default function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ flow: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <FlowRouter
      params={params}
      searchParams={searchParams}
      url="/auth"
      flowMap={{
        login: (flow) => <div>Custom Login Form</div>,
        registration: (flow) => <div>Custom Registration Form</div>
      }}
    />
  );
}
```

## Installation

```bash
# npm
npm install @omnibase/nextjs

# yarn
yarn add @omnibase/nextjs

# pnpm
pnpm add @omnibase/nextjs

# bun
bun add @omnibase/nextjs
```

## Environment Configuration

```bash
# Required
OMNIBASE_AUTH_URL=http://localhost:4433             # Your OmniBase Auth URL
SUPABASE_URL=http://localhost:8080                  # Your Supabase API URL
# Optional - Tenant Management
OMNIBASE_ONBOARDING_REDIRECT_URL=/dashboard         # Redirect after tenant creation
OMNIBASE_DELETE_TENANT_REDIRECT_URL=/               # Redirect after tenant deletion
OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL=/dashboard # Redirect after accepting invite
```

## Complete Workflow Example

This example demonstrates a complete authentication and multi-tenant workflow:

```tsx
// app/layout.tsx - Setup SessionProvider
import { SessionProvider } from '@omnibase/nextjs/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

// app/dashboard/page.tsx - Protected route with session access
import { getServerSession } from '@omnibase/nextjs/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>Welcome, {session.identity.traits.email}</h1>
      <p>Active Tenant: {session.tenant?.name}</p>
    </div>
  );
}

// app/tenant/create/page.tsx - Create tenant with server action
import { createTenantAction } from '@omnibase/nextjs/auth';
import { useActionState } from 'react';

export default function CreateTenant({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(createTenantAction, null);

  return (
    <form action={formAction}>
      <input name="name" type="text" required />
      <input name="billing_email" type="email" required />
      <input name="user_id" type="hidden" value={userId} />
      
      {state?.error && <div role="alert">{state.error}</div>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Organization"}
      </button>
    </form>
  );
}
```

## Middleware

**⚠️ REQUIRED**: The OmniBase middleware is essential for authentication to work properly. Without it, sessions will not be validated and authentication flows will not function.

```tsx
// middleware.ts
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export default createOmniBaseMiddleware();

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

The middleware automatically handles:
- Session validation (required for authentication)
- Authentication redirects
- Cookie management
- Ory Kratos integration

## Authentication

The SDK provides comprehensive authentication support through Ory Kratos integration. Access session data on the server using [`getServerSession()`](Auth/index.md), handle authentication flows with [`FlowRouter`](_media/flow-router.ts), and protect routes with middleware.

## Multi-tenant

Manage organizations with server actions for creating ([`createTenantAction`](_media/management.ts)), switching ([`switchActiveTenantAction`](_media/management.ts)), and deleting tenants ([`deleteTenantAction`](_media/management.ts)). Handle user invitations with [`acceptTenantInviteAction`](_media/invites.ts).

## Error Handling

The SDK provides consistent error handling across all operations:

```tsx
import { createTenantAction } from '@omnibase/nextjs/auth';

export default function CreateTenantForm() {
  const [state, formAction, isPending] = useActionState(createTenantAction, null);

  return (
    <form action={formAction}>
      {/* Form fields */}
      
      {/* Error display */}
      {state?.error && (
        <div className="error-message" role="alert">
          <strong>Error:</strong> {state.error}
        </div>
      )}
      
      {/* Success handling happens via redirect */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Server Actions

All server actions return structured responses:

```tsx
// Pattern: { success: boolean, error?: string, message?: string }
// Some actions redirect on success (create, delete, accept invite)
const [state, action, isPending] = useActionState(createTenantAction, null);
```

## Security Features

| Feature | Description |
|---------|-------------|
| Server-Side Sessions | All session handling happens on the server for maximum security |
| Encrypted Cookies | JWT tokens are stored in secure, HTTP-only cookies |
| CSRF Protection | Built-in CSRF protection for all server actions |
| Automatic Token Management | Seamless token refresh and rotation |

## Environment Support

**Runtime Environments**
- ✅ Next.js 15+ (App Router)
- ✅ Next.js 13+ (App Router)
- ✅ Node.js 18+
- ✅ Edge Runtime

**Frameworks**
- ✅ Next.js App Router
- ✅ React Server Components
- ✅ React Server Actions
- ✅ Next.js Middleware

**Module Systems**
- ✅ ESM (ES Modules)
- ✅ CommonJS
- ✅ TypeScript

## Modules Overview

**Auth Module**: Provides React Server Components, session management, flow routing, and server actions for handling all Ory Kratos authentication flows including login, registration, recovery, verification, and user settings.

**Middleware Module**: Offers Next.js middleware integration with OmniBase for automatic session validation, authentication redirects, and secure cookie management at the edge.

**Tenant Module**: Enables multi-tenant functionality with server actions for creating, switching, deleting tenants, and managing user invitations with automatic JWT token management.

## Related Packages

- [@omnibase/core-js](_media/core-js) - Framework-agnostic core JavaScript SDK with shared functionality
- [@omnibase/shadcn](_media/shadcn) - Pre-built authentication UI components using shadcn/ui

## License

MIT License - see LICENSE file for details.

## Modules

- [Auth](Auth/index.md)
- [Tenants](Tenants/index.md)
