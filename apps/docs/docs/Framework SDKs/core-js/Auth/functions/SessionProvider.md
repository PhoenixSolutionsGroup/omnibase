# Function: SessionProvider()

> **SessionProvider**(`props`): `Promise`\<`Element`\>

Defined in: [src/auth/provider.tsx:99](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/provider.tsx#L99)

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

## Parameters

### props

Component props

#### children?

`ReactNode`

React nodes to be wrapped with session context

## Returns

`Promise`\<`Element`\>

Promise resolving to a session provider component with session data

## Example

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

## Since

0.5.1
