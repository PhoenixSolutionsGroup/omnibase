# Function: getRecoveryFlow()

> **getRecoveryFlow**(`props`): `Promise`\<`null` \| `RecoveryFlow`\>

Defined in: [src/auth/get-flow.ts:129](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L129)

Retrieves a recovery flow for password reset and account recovery

Fetches recovery flow data from Ory Kratos, which provides the form structure
and configuration needed to render a password recovery interface. Users can
request password reset links via email.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `RecoveryFlow`\>

Promise that resolves to a RecoveryFlow object or null if the flow cannot be retrieved

## Example

```typescript
// In a Next.js server component
import { getRecoveryFlow } from '@omnibase/nextjs/auth';

const flow = await getRecoveryFlow({
  url: '/auth/recovery',
  searchParams: Promise.resolve({ flow: 'def456' })
});

if (flow) {
  return <RecoveryForm flow={flow} />;
}
```

## Since

0.5.1
