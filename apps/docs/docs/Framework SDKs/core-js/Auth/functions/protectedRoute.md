# Function: protectedRoute()

> **protectedRoute**(`redirectTo`): `Promise`\<`Session`\>

Defined in: [src/auth/protected-route.ts:45](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/protected-route.ts#L45)

Server-side route protection utility for Next.js App Router

This function protects server-side routes by checking if the user has an
active session. It uses [`getServerSession`](./provider.tsx:26) to fetch
session data on the server and automatically redirects to a specified path
if the session is invalid or inactive.

This utility is designed for Next.js 13+ App Router with Server Components
and Server Actions. It leverages server-side session validation without
exposing authentication logic to the client, making it ideal for protecting
pages, layouts, and Server Actions that require authentication.

## Parameters

### redirectTo

`string` = `"/auth/login"`

Path to redirect to when session is invalid or missing

## Returns

`Promise`\<`Session`\>

Promise resolving to the active session object

## Throws

Never throws - redirects instead using Next.js `redirect()`

## Example

```typescript
// Protect a dashboard page requiring authentication
import { protectedRoute } from '@omnibase/nextjs/auth';

export default async function DashboardPage() {
  const session = await protectedRoute('/auth/login');

  return (
    <div>
      <h1>Welcome, {session.identity.traits.email}!</h1>
      <p>User ID: {session.identity.id}</p>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  );
}
```

## Since

0.5.1
