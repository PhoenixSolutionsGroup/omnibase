# Function: getLoginFlow()

> **getLoginFlow**(`props`): `Promise`\<`null` \| `LoginFlow`\>

Defined in: src/auth/get-flow.ts:47

Retrieves a login flow for user authentication.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `LoginFlow`\>

Promise that resolves to a LoginFlow object or null if the flow cannot be retrieved
