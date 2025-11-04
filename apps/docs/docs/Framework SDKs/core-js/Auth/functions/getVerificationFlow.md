# Function: getVerificationFlow()

> **getVerificationFlow**(`props`): `Promise`\<`null` \| `VerificationFlow`\>

Defined in: [src/auth/get-flow.ts:264](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L264)

Retrieves a verification flow for email or account verification

Fetches verification flow data from Ory Kratos, which handles email and account
verification processes. Users receive verification links via email that include
the flow ID in the URL parameters.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `VerificationFlow`\>

Promise that resolves to a VerificationFlow object or null if the flow cannot be retrieved

## Example

```typescript
// In a Next.js server component
import { getVerificationFlow } from '@omnibase/nextjs/auth';

const flow = await getVerificationFlow({
  url: '/auth/verification',
  searchParams: Promise.resolve({ flow: 'mno345', code: 'verify-token' })
});

if (flow) {
  return <VerificationForm flow={flow} />;
}
```

## Since

0.5.1
