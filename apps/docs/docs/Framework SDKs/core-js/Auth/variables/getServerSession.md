# Variable: getServerSession()

> `const` **getServerSession**: () => `Promise`\<`any`\> = `getServerSessionOry`

Defined in: src/auth/provider.tsx:22

A helper to fetch the session on the server side. This method works with server-side rendering.

A helper to fetch the session on the server side. This method works with server-side rendering.

```ts
import { getServerSession } from "@ory/nextjs/app"

async function MyComponent() {
 const session = await getServerSession()

 if (!session) {
   return <p>No session found</p>
 }

}
```

## Returns

`Promise`\<`any`\>

The session object or null if no session is found.

## Example

````tsx
 import { getServerSession } from "@omnibase/nextjs/auth"

 async function MyComponent() {
     const session = await getServerSession()

     if (!session) {
         return <p>No session found</p>
     }
 }
````
