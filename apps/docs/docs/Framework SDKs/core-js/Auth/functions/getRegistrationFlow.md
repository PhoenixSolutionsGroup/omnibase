# Function: getRegistrationFlow()

> **getRegistrationFlow**(`props`): `Promise`\<`null` \| `RegistrationFlow`\>

Defined in: [src/auth/get-flow.ts:174](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L174)

Retrieves a registration flow for new user account creation

Fetches registration flow data from Ory Kratos, which includes the form structure
for user signup. This typically includes fields for email, password, and any
custom traits defined in your Ory Kratos identity schema.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `RegistrationFlow`\>

Promise that resolves to a RegistrationFlow object or null if the flow cannot be retrieved

## Example

```typescript
// In a Next.js server component
import { getRegistrationFlow } from '@omnibase/nextjs/auth';

const flow = await getRegistrationFlow({
  url: '/auth/registration',
  searchParams: Promise.resolve({ flow: 'ghi789' })
});

if (flow) {
  return <RegistrationForm flow={flow} />;
}
```

## Since

0.5.1
