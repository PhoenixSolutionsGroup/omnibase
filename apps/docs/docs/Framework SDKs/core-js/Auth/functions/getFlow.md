# Function: getFlow()

> **getFlow**(`flowType`, `props`): `Promise`\<`null` \| [`FlowObject`](../type-aliases/FlowObject.md)\>

Defined in: [src/auth/flow-router.ts:101](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L101)

Retrieves the appropriate flow object based on the flow type

This function acts as a router for authentication flows, delegating to the
appropriate flow retrieval function based on the flow type. It's used internally
by FlowRouter but can also be used independently for custom flow handling.

## Parameters

### flowType

keyof [`FlowMap`](../type-aliases/FlowMap.md)

The type of flow to retrieve (login, registration, recovery, verification, settings, onboarding)

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| [`FlowObject`](../type-aliases/FlowObject.md)\>

Promise that resolves to the corresponding flow object or null if not found/supported

## Example

```typescript
// Retrieve a login flow
const loginFlow = await getFlow('login', {
  url: '/auth/login',
  searchParams: Promise.resolve({ flow: 'abc123' })
});

if (loginFlow) {
  console.log('Login flow retrieved:', loginFlow.id);
}
```

## Since

0.5.1
