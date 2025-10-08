# Auth

Authentication module for Next.js

This module provides comprehensive authentication functionality for Next.js applications
built on top of Ory Kratos. It includes session management, authentication flow routing,
callback handling, and server-side session retrieval optimized for the Next.js App Router.

Key features:
- **Session Management**: Server-side session provider and retrieval functions
- **Flow Routing**: Dynamic routing for auth flows (login, registration, recovery, etc.)
- **Callback Handling**: OAuth and authentication callback processing
- **Server Components**: Built for Next.js 13+ App Router with server components
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions

The authentication system supports multiple flows:
- Login flow for user authentication
- Registration flow for new user signup
- Recovery flow for password reset
- Verification flow for email/phone verification
- Settings flow for user profile management
- OAuth flows for social login providers

## Examples

Basic authentication setup:
```typescript
// In your root layout (app/layout.tsx)
import { SessionProvider } from '@omnibase/nextjs/auth';

export default async function RootLayout({ children }) {
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

// In your auth page (app/auth/[...flow]/page.tsx)
import { FlowRouter } from '@omnibase/nextjs/auth';
import { LoginForm, RegisterForm } from './components';

export default function AuthPage({ params, searchParams }) {
  return (
    <FlowRouter
      params={params}
      searchParams={searchParams}
      url="/auth"
      flowMap={{
        login: (flow) => <LoginForm flow={flow} />,
        registration: (flow) => <RegisterForm flow={flow} />
      }}
    />
  );
}
```

Server-side session handling:
```typescript
import { getServerSession } from '@omnibase/nextjs/auth';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <div>Welcome {session.identity.traits.email}</div>;
}
```

## Interfaces

- [FlowRouterProps](interfaces/FlowRouterProps.md)

## Type Aliases

- [CallbackFlow](type-aliases/CallbackFlow.md)
- [FlowMap](type-aliases/FlowMap.md)
- [FlowObject](type-aliases/FlowObject.md)
- [FlowRedirects](type-aliases/FlowRedirects.md)
- [GetFlowProps](type-aliases/GetFlowProps.md)
- [LogoutFlowReturnType](type-aliases/LogoutFlowReturnType.md)

## Variables

- [getServerSession](variables/getServerSession.md)

## Functions

- [FlowRouter](functions/FlowRouter.md)
- [getFlow](functions/getFlow.md)
- [getLoginFlow](functions/getLoginFlow.md)
- [getLogoutFlow](functions/getLogoutFlow.md)
- [getRecoveryFlow](functions/getRecoveryFlow.md)
- [getRegistrationFlow](functions/getRegistrationFlow.md)
- [getSettingsFlow](functions/getSettingsFlow.md)
- [getVerificationFlow](functions/getVerificationFlow.md)
- [handleAuthCallback](functions/handleAuthCallback.md)
- [SessionProvider](functions/SessionProvider.md)
