# Function: getRegistrationFlow()

> **getRegistrationFlow**(`props`): `Promise`\<`null` \| `RegistrationFlow`\>

Defined in: src/auth/get-flow.ts:87

Retrieves a registration flow for new user account creation.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `RegistrationFlow`\>

Promise that resolves to a RegistrationFlow object or null if the flow cannot be retrieved
