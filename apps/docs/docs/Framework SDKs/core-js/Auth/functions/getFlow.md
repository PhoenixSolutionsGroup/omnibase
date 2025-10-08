# Function: getFlow()

> **getFlow**(`flowType`, `props`): `Promise`\<`null` \| [`FlowObject`](../type-aliases/FlowObject.md)\>

Defined in: src/auth/flow-router.ts:61

Retrieves the appropriate flow object based on the flow type.

## Parameters

### flowType

keyof [`FlowMap`](../type-aliases/FlowMap.md)

The type of flow to retrieve (login, registration, recovery, verification, settings)

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| [`FlowObject`](../type-aliases/FlowObject.md)\>

Promise that resolves to the corresponding flow object or null if not found/supported

## Example

```tsx
const flow = await getFlow('login', {
  url: '/auth/login',
  searchParams: Promise.resolve({ flow: 'abc123' })
});
```
