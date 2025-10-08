# Function: getLogoutFlow()

> **getLogoutFlow**(`props`): `Promise`\<`null` \| [`LogoutFlowReturnType`](../type-aliases/LogoutFlowReturnType.md)\>

Defined in: src/auth/get-flow.ts:159

Retrieves a logout flow for the authenticated user, providing both server-side
and client-side logout capabilities.

## Parameters

### props

Configuration object containing the return URL after logout

#### returnTo

`string`

## Returns

`Promise`\<`null` \| [`LogoutFlowReturnType`](../type-aliases/LogoutFlowReturnType.md)\>

Promise that resolves to a LogoutFlowReturnType object containing:
  - `flow`: LogoutFlow that ensures the user will log out on the auth server
  - `action`: Server action function that ensures logout on the browser/client by clearing cookies
Returns null if the flow cannot be retrieved.
