# Interface: FlowRouterProps

Defined in: src/auth/flow-router.ts:86

Props for the FlowRouter component

## Properties

### flowMap

> **flowMap**: [`FlowMap`](../type-aliases/FlowMap.md)

Defined in: src/auth/flow-router.ts:90

Map of flow types to React component functions

***

### onNotFound?

> `optional` **onNotFound**: `ReactNode`

Defined in: src/auth/flow-router.ts:92

Component to render when flow type is not found

***

### params

> **params**: `Promise`\<\{ `flow`: `string`[]; \}\>

Defined in: src/auth/flow-router.ts:88

NextJS params containing the flow type

***

### searchParams

> **searchParams**: `Promise`\<\{\[`key`: `string`\]: `undefined` \| `string` \| `string`[]; \}\>

Defined in: src/auth/flow-router.ts:96

Search parameters from the request

***

### url

> **url**: `string`

Defined in: src/auth/flow-router.ts:94

URL for the current flow
