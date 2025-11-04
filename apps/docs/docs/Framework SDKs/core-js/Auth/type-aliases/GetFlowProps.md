# Type Alias: GetFlowProps

> **GetFlowProps** = `object`

Defined in: [src/auth/get-flow.ts:45](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L45)

Properties required for retrieving authentication flows

Configuration object used to fetch authentication flow data from Ory Kratos.
This type is used by all flow retrieval functions to specify the UI URL and
pass along search parameters that contain flow state.

## Example

```typescript
const props: GetFlowProps = {
  url: '/auth/login',
  searchParams: Promise.resolve({ flow: 'abc123' })
};
```

## Since

0.5.1

## Properties

### searchParams

> **searchParams**: `Promise`\<\{\[`key`: `string`\]: `undefined` \| `string` \| `string`[]; \}\>

Defined in: [src/auth/get-flow.ts:49](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L49)

Promise resolving to search parameters from the request, containing flow ID and state

***

### url

> **url**: `string`

Defined in: [src/auth/get-flow.ts:47](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L47)

The UI URL for the specific authentication flow (e.g., '/auth/login')
