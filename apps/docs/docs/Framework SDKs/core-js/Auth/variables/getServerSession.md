# Variable: getServerSession()

> `const` **getServerSession**: () => `Promise`\<`Session`\>

Defined in: [src/auth/provider.tsx:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/provider.tsx#L50)

Fetches the current session on the server side

This helper function retrieves the authenticated user's session from Ory Kratos
in Next.js Server Components and Server Actions. It works with server-side rendering
and leverages Next.js's cookie handling to access session data securely.

The session object contains the user's identity, authentication status, and session
metadata. Use this function to check authentication status, access user data, or
implement authorization logic in server components.

## Returns

`Promise`\<`Session`\>

Promise resolving to the Session object, or null if no active session exists

## Example

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

## Since

0.5.1
