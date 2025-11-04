# Interface: FlowRouterProps

Defined in: [src/auth/flow-router.ts:133](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L133)

Props for the FlowRouter component

Configuration object for the FlowRouter component that handles dynamic
authentication flow routing in Next.js applications.

## Since

0.5.1

## Properties

### flowMap

> **flowMap**: [`FlowMap`](../type-aliases/FlowMap.md)

Defined in: [src/auth/flow-router.ts:137](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L137)

Map of flow types to their corresponding React component render functions

***

### onNotFound?

> `optional` **onNotFound**: `ReactNode`

Defined in: [src/auth/flow-router.ts:139](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L139)

Component to render when the requested flow type is not found or not supported

***

### params

> **params**: `Promise`\<\{ `flow`: `string`[]; \}\>

Defined in: [src/auth/flow-router.ts:135](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L135)

Next.js params promise containing the flow type from dynamic route segments

***

### returnTo?

> `optional` **returnTo**: `string`

Defined in: [src/auth/flow-router.ts:148](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L148)

URL to redirect to after flow completion

#### Default Value

```ts
"/"
```

***

### searchParams

> **searchParams**: `Promise`\<\{\[`key`: `string`\]: `undefined` \| `string` \| `string`[]; \}\>

Defined in: [src/auth/flow-router.ts:143](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L143)

Promise resolving to search parameters from the request URL

***

### url

> **url**: `string`

Defined in: [src/auth/flow-router.ts:141](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L141)

Base URL path for authentication flows (e.g., '/auth')
