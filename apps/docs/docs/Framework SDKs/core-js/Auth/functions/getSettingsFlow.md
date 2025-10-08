# Function: getSettingsFlow()

> **getSettingsFlow**(`props`): `Promise`\<`null` \| `SettingsFlow`\>

Defined in: src/auth/get-flow.ts:108

Retrieves a settings flow for user account management and profile updates.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `SettingsFlow`\>

Promise that resolves to a SettingsFlow object or null if the flow cannot be retrieved
