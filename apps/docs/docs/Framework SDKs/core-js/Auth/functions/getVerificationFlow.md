# Function: getVerificationFlow()

> **getVerificationFlow**(`props`): `Promise`\<`null` \| `VerificationFlow`\>

Defined in: src/auth/get-flow.ts:129

Retrieves a verification flow for email or account verification.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `VerificationFlow`\>

Promise that resolves to a VerificationFlow object or null if the flow cannot be retrieved
