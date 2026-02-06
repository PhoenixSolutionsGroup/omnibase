---
title: "Authentication"
---

# Authentication

Route protection utilities for securing pages and API routes that require
an authenticated user session.

### protectedRoute()

```ts
function protectedRoute(redirectTo): Promise<Session>;
```

Defined in: [sdk/framework/nextjs/src/auth/protected-route.ts:45](https://github.com/PhoenixSolutionsGroup/omnibase/blob/839727be64cacc43402648e78c8d3dd8c4100293/sdk/framework/nextjs/src/auth/protected-route.ts#L45)

Server-side route protection utility for Next.js App Router

This function protects server-side routes by checking if the user has an
active session. It uses [`getServerSession`](./provider.tsx:26) to fetch
session data on the server and automatically redirects to a specified path
if the session is invalid or inactive.

This utility is designed for Next.js 13+ App Router with Server Components
and Server Actions. It leverages server-side session validation without
exposing authentication logic to the client, making it ideal for protecting
pages, layouts, and Server Actions that require authentication.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `redirectTo` | `string` | `"/auth/login"` | Path to redirect to when session is invalid or missing |

#### Returns

`Promise`\<`Session`\>

Promise resolving to the active session object

#### Throws

Never throws - redirects instead using Next.js `redirect()`

#### Example

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

#### Since

0.5.1