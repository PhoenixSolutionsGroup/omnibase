# Function: getLoginFlow()

> **getLoginFlow**(`props`): `Promise`\<`null` \| `LoginFlow`\>

Defined in: [src/auth/get-flow.ts:86](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L86)

Retrieves a login flow for user authentication

Fetches login flow data from Ory Kratos, which includes form fields, CSRF tokens,
and UI configuration needed to render a login form. This function is used server-side
in Next.js App Router components.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `LoginFlow`\>

Promise that resolves to a LoginFlow object or null if the flow cannot be retrieved

## Example

```typescript
// In a Next.js server component
import { getLoginFlow } from '@omnibase/nextjs/auth';

const flow = await getLoginFlow({
  url: '/auth/login',
  searchParams: Promise.resolve({ flow: 'abc123' })
});

if (flow) {
  return <LoginForm flow={flow} />;
}
```

## Since

0.5.1
