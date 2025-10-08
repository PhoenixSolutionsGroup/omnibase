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
| Session Management | Server-side session handling with React Context integration | [Session Docs](#session-management) |
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

## Authentication

### Session Provider

Wrap your application with the `SessionProvider` to enable server-side session management:

```tsx
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
```

### Server Session Access

Access session data on the server side:

```tsx
import { getServerSession } from '@omnibase/nextjs/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>Welcome, {session.identity.traits.email}</h1>
      <p>Session ID: {session.id}</p>
    </div>
  );
}
```

## Flow Router

Handle all authentication flows automatically with the `FlowRouter` component:

```tsx
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
        login: (flow) => <LoginForm flow={flow} />,
        registration: (flow) => <RegistrationForm flow={flow} />,
        recovery: (flow) => <RecoveryForm flow={flow} />,
        verification: (flow) => <VerificationForm flow={flow} />,
        settings: (flow) => <SettingsForm flow={flow} />
      }}
      onNotFound={<div>Authentication flow not found</div>}
    />
  );
}
```

## Multi-tenant

### Creating Tenants

```tsx
import { createTenantAction } from '@omnibase/nextjs/auth';
import { useActionState } from 'react';

export default function CreateTenantForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(createTenantAction, null);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Organization Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="billing_email">Billing Email</label>
        <input
          id="billing_email"
          name="billing_email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <input name="user_id" type="hidden" value={userId} />
      <input name="redirect_to" type="hidden" value="/dashboard" />

      {state?.error && (
        <div className="error" role="alert">
          {state.error}
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Organization"}
      </button>
    </form>
  );
}
```

### Switching Tenants

```tsx
import { switchActiveTenantAction } from '@omnibase/nextjs/auth';
import { useActionState } from 'react';

export default function TenantSwitcher({ tenantId }: { tenantId: string }) {
  const [state, action] = useActionState(switchActiveTenantAction, null);

  return (
    <form action={action}>
      <input type="hidden" name="tenant_id" value={tenantId} />
      <button type="submit" disabled={state?.pending}>
        {state?.pending ? 'Switching...' : 'Switch Organization'}
      </button>

      {state?.success && (
        <p style={{ color: 'green' }}>{state.message}</p>
      )}
      {state?.error && (
        <p style={{ color: 'red' }}>{state.error}</p>
      )}
    </form>
  );
}
```

### Accepting Tenant Invitations

```tsx
import { acceptTenantInviteAction } from '@omnibase/nextjs/auth';
import { useActionState } from 'react';

export default function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(acceptTenantInviteAction, null);

  return (
    <form action={formAction}>
      <input name="token" type="hidden" value={token} />
      <input name="redirect_to" type="hidden" value="/dashboard" />

      {state?.error && (
        <div className="error" role="alert">
          {state.error}
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Accepting..." : "Accept Invitation"}
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

## Server Actions

All server actions follow a consistent pattern and return structured responses:

```tsx
import { 
  createTenantAction,
  switchActiveTenantAction,
  deleteTenantAction,
  acceptTenantInviteAction 
} from '@omnibase/nextjs/auth';

// All actions return { success: boolean, error?: string, message?: string }
// Or redirect on success (create, delete, accept invite actions)

// Example with error handling
async function handleTenantOperation() {
  const formData = new FormData();
  formData.append('tenant_id', 'tenant-123');

  const result = await switchActiveTenantAction(formData);
  
  if (!result.success) {
    console.error('Operation failed:', result.error);
    return;
  }
  
  console.log('Success:', result.message);
}
```

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

## Authentication Callback

Handle authentication callbacks in your application:

```tsx
import { handleAuthCallback, type FlowRedirects } from '@omnibase/nextjs/auth';

const redirects: FlowRedirects = {
  login: '/dashboard'
};

export async function GET(request: Request) {
  return handleAuthCallback(
    request,
    (error) => {
      console.error('Auth callback error:', error);
      // Handle error response
    },
    redirects
  );
}
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

- [@omnibase/core-js](../core-js) - Framework-agnostic core JavaScript SDK with shared functionality
- [@omnibase/shadcn](../shadcn) - Pre-built authentication UI components using shadcn/ui

## License

MIT License - see LICENSE file for details.