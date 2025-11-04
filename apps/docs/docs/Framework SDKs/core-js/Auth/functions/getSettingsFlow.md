# Function: getSettingsFlow()

> **getSettingsFlow**(`props`): `Promise`\<`null` \| `SettingsFlow`\>

Defined in: [src/auth/get-flow.ts:219](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L219)

Retrieves a settings flow for user account management and profile updates

Fetches settings flow data from Ory Kratos, which provides forms for updating
user profile information, changing passwords, managing authentication methods,
and other account settings. This requires an active user session.

## Parameters

### props

[`GetFlowProps`](../type-aliases/GetFlowProps.md)

Configuration object containing URL and search parameters

## Returns

`Promise`\<`null` \| `SettingsFlow`\>

Promise that resolves to a SettingsFlow object or null if the flow cannot be retrieved

## Example

```typescript
// In a Next.js server component (requires authenticated session)
import { getSettingsFlow } from '@omnibase/nextjs/auth';

const flow = await getSettingsFlow({
  url: '/auth/settings',
  searchParams: Promise.resolve({ flow: 'jkl012' })
});

if (flow) {
  return <SettingsForm flow={flow} />;
}
```

## Since

0.5.1
