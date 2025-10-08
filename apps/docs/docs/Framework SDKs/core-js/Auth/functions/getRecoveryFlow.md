# Function: getRecoveryFlow()

> **getRecoveryFlow**(`props`): `Promise`\<`null` \| `RecoveryFlow`\>

Defined in: src/auth/get-flow.ts:66

Retrieves a recovery flow for password reset and account recovery.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `RecoveryFlow`\>

Promise that resolves to a RecoveryFlow object or null if the flow cannot be retrieved
