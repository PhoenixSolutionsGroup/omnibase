# Function: SessionProvider()

> **SessionProvider**(`props`): `Promise`\<`Element`\>

Defined in: src/auth/provider.tsx:50

A server-side React component that provides session context to its children.
This component fetches the current session from the server and wraps children
with a session provider to make session data available throughout
the component tree.

## Parameters

### props

The component props

#### children?

`ReactNode`

Optional React nodes to be wrapped with session context

## Returns

`Promise`\<`Element`\>

A Promise that resolves to a session provider component with session data

## Example

```tsx
// Use in the root layout component
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
```
