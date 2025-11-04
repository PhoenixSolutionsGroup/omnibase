# Function: getLogoutFlow()

> **getLogoutFlow**(`props`): `Promise`\<`null` \| [`LogoutFlowReturnType`](../type-aliases/LogoutFlowReturnType.md)\>

Defined in: [src/auth/get-flow.ts:335](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L335)

Retrieves a logout flow for the authenticated user with complete logout handling

Fetches logout flow data from Ory Kratos and provides a server action that handles
the complete logout process. This includes clearing session cookies (ory_kratos_session,
ory_kratos_continuity, omnibase_postgrest_jwt) and calling the Ory logout endpoint.

The returned action should be called from a form or button to execute the logout
and redirect the user to the specified return URL.

## Parameters

### props

Configuration object containing the return URL after logout

#### returnTo

`string`

URL to redirect to after successful logout

## Returns

`Promise`\<`null` \| [`LogoutFlowReturnType`](../type-aliases/LogoutFlowReturnType.md)\>

Promise that resolves to a LogoutFlowReturnType object containing the flow and action, or null if the flow cannot be retrieved

## Throws

Will redirect to the returnTo URL after successful logout

## Example

```typescript
// In a Next.js server component
import { getLogoutFlow } from '@omnibase/nextjs/auth';

export default async function LogoutButton() {
  const logoutFlow = await getLogoutFlow({ returnTo: '/' });

  if (!logoutFlow) {
    return <div>Unable to logout</div>;
  }

  return (
    <form action={logoutFlow.action}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

## Since

0.5.1
