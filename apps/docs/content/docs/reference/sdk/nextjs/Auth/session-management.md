---
title: "Session Management"
---

# Session Management

Server-side session handling for Next.js applications. These utilities enable
secure session fetching and React Context integration for authentication state
management across your component tree.

### getServerSession()

```ts
const getServerSession: () => Promise<Session>;
```

Defined in: [sdk/framework/nextjs/src/auth/provider.tsx:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/provider.tsx#L50)

Fetches the current session on the server side

This helper function retrieves the authenticated user's session from Ory Kratos
in Next.js Server Components and Server Actions. It works with server-side rendering
and leverages Next.js's cookie handling to access session data securely.

The session object contains the user's identity, authentication status, and session
metadata. Use this function to check authentication status, access user data, or
implement authorization logic in server components.

#### Returns

`Promise`\<`Session`\>

Promise resolving to the Session object, or null if no active session exists

#### Example

```tsx
// Check authentication and access user data
import { getServerSession } from '@omnibase/nextjs/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session || !session.active) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session.identity.traits.email}</p>
      <p>User ID: {session.identity.id}</p>
    </div>
  );
}
```

#### Since

0.5.1

***

### SessionProvider()

```ts
function SessionProvider(props): Promise<Element>;
```

Defined in: [sdk/framework/nextjs/src/auth/provider.tsx:99](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/provider.tsx#L99)

Server-side React component that provides session context to the component tree

This async server component fetches the current session from Ory Kratos and wraps
children with a session provider, making session data available throughout the
component tree via React Context. It's designed to be used in the root layout
of Next.js 13+ applications.

The SessionProvider enables client components to access session data via the
Ory Elements session hook, while still maintaining server-side session fetching
for optimal performance and security.

**Note**: This component should be placed in your root layout to provide session
context to all pages in your application.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | \{ `children?`: `ReactNode`; \} | Component props |
| `props.children?` | `ReactNode` | React nodes to be wrapped with session context |

#### Returns

`Promise`\<`Element`\>

Promise resolving to a session provider component with session data

#### Example

```tsx
// app/layout.tsx - Root layout with session provider
import { SessionProvider } from '@omnibase/nextjs/auth';

export default async function RootLayout({
  children
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

#### Since

0.5.1