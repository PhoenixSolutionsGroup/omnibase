---
title: "Flow Retrieval"
---

# Flow Retrieval

Server-side functions for fetching authentication flow data from Ory Kratos.
These functions handle the flow lifecycle and return typed flow objects.

### GetErrorFlowProps

```ts
type GetErrorFlowProps = {
  searchParams: Promise<{
   [key: string]: string | string[] | undefined;
  }>;
};
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:368](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L368)

Properties required for retrieving error flow details

#### Since

0.7.0

#### Properties

##### searchParams

```ts
searchParams: Promise<{
[key: string]: string | string[] | undefined;
}>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:370](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L370)

Promise resolving to search parameters containing the error ID

***

### GetFlowProps

```ts
type GetFlowProps = {
  searchParams: Promise<{
   [key: string]: string | string[] | undefined;
  }>;
  url: string;
};
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:43](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L43)

Properties required for retrieving authentication flows

Configuration object used to fetch authentication flow data from Ory Kratos.
This type is used by all flow retrieval functions to specify the UI URL
and pass along search parameters that contain flow state.

#### Example

```typescript
const props: GetFlowProps = {
  url: '/auth/login',
  searchParams: Promise.resolve({ flow: 'abc123' })
};
```

#### Since

0.5.1

#### Properties

##### searchParams

```ts
searchParams: Promise<{
[key: string]: string | string[] | undefined;
}>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:47](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L47)

Promise resolving to search parameters from the request, containing flow ID and state

##### url

```ts
url: string;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:45](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L45)

The UI URL for the specific authentication flow (e.g., '/auth/login')

***

### LogoutFlowReturnType

```ts
type LogoutFlowReturnType = {
  action: () => Promise<void>;
  flow: LogoutFlow;
};
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:285](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L285)

Return type for the getLogoutFlow function

Contains both the logout flow data and a server action for executing
the logout process, including clearing all authentication cookies.

#### Since

0.5.1

#### Properties

##### action()

```ts
action: () => Promise<void>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:289](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L289)

Server action that clears authentication cookies and completes logout

###### Returns

`Promise`\<`void`\>

##### flow

```ts
flow: LogoutFlow;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:287](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L287)

Logout flow object from Ory Kratos containing logout URL and token

***

### getErrorFlow()

```ts
function getErrorFlow(props): Promise<FlowError | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:405](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L405)

Retrieves error details for a user-facing authentication error

When Ory Kratos encounters an error during authentication flows (CSRF failures,
expired flows, OAuth errors, etc.), it redirects to the error UI with an error ID.
This function fetches the error details using that ID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetErrorFlowProps`](#geterrorflowprops) | Configuration object containing search parameters |

#### Returns

`Promise`\<[`FlowError`](#flowerror) \| `null`\>

Promise that resolves to a FlowError object or null if the error cannot be retrieved

#### Example

```typescript
// In a Next.js server component
import { getErrorFlow } from '@omnibase/nextjs/auth';

const error = await getErrorFlow({
  searchParams: Promise.resolve({ id: 'error-id-123' })
});

if (error) {
  return <ErrorForm error={error} />;
}
```

#### Since

0.7.0

***

### getLoginFlow()

```ts
function getLoginFlow(props): Promise<LoginFlow | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:84](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L84)

Retrieves a login flow for user authentication

Fetches login flow data from Ory Kratos, which includes form fields, CSRF tokens,
and UI configuration needed to render a login form. This function is used server-side
in Next.js App Router components.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<`LoginFlow` \| `null`\>

Promise that resolves to a LoginFlow object or null if the flow cannot be retrieved

#### Example

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

#### Since

0.5.1

***

### getLogoutFlow()

```ts
function getLogoutFlow(props): Promise<LogoutFlowReturnType | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:333](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L333)

Retrieves a logout flow for the authenticated user with complete logout handling

Fetches logout flow data from Ory Kratos and provides a server action that handles
the complete logout process. This includes clearing session cookies (ory_kratos_session,
ory_kratos_continuity, omnibase_postgrest_jwt) and calling the Ory logout endpoint.

The returned action should be called from a form or button to execute the logout
and redirect the user to the specified return URL.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | \{ `returnTo`: `string`; \} | Configuration object containing the return URL after logout |
| `props.returnTo` | `string` | URL to redirect to after successful logout |

#### Returns

`Promise`\<[`LogoutFlowReturnType`](#logoutflowreturntype) \| `null`\>

Promise that resolves to a LogoutFlowReturnType object containing the flow and action, or null if the flow cannot be retrieved

#### Throws

Will redirect to the returnTo URL after successful logout

#### Example

```typescript
// In a Next.js server component
import { getLogoutFlow } from '@omnibase/nextjs/auth';

export default async function LogoutButton() {
  const logoutFlow = await getLogoutFlow({ returnTo: '/' });

  if (!logoutFlow) {
    return <div>Unable to logout</div>;
  }

  return (
    <form action={logoutFlow.action}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

#### Since

0.5.1

***

### getRecoveryFlow()

```ts
function getRecoveryFlow(props): Promise<RecoveryFlow | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:127](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L127)

Retrieves a recovery flow for password reset and account recovery

Fetches recovery flow data from Ory Kratos, which provides the form structure
and configuration needed to render a password recovery interface. Users can
request password reset links via email.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<`RecoveryFlow` \| `null`\>

Promise that resolves to a RecoveryFlow object or null if the flow cannot be retrieved

#### Example

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

#### Since

0.5.1

***

### getRegistrationFlow()

```ts
function getRegistrationFlow(props): Promise<RegistrationFlow | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:172](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L172)

Retrieves a registration flow for new user account creation

Fetches registration flow data from Ory Kratos, which includes the form structure
for user signup. This typically includes fields for email, password, and any
custom traits defined in your Ory Kratos identity schema.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<`RegistrationFlow` \| `null`\>

Promise that resolves to a RegistrationFlow object or null if the flow cannot be retrieved

#### Example

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

#### Since

0.5.1

***

### getSettingsFlow()

```ts
function getSettingsFlow(props): Promise<SettingsFlow | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:217](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L217)

Retrieves a settings flow for user account management and profile updates

Fetches settings flow data from Ory Kratos, which provides forms for updating
user profile information, changing passwords, managing authentication methods,
and other account settings. This requires an active user session.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<`SettingsFlow` \| `null`\>

Promise that resolves to a SettingsFlow object or null if the flow cannot be retrieved

#### Example

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

#### Since

0.5.1

***

### getVerificationFlow()

```ts
function getVerificationFlow(props): Promise<VerificationFlow | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/get-flow.ts:262](https://github.com/PhoenixSolutionsGroup/omnibase/blob/158be407f331efc695d0d73b742b41ff9dd088e6/sdk/framework/nextjs/src/auth/get-flow.ts#L262)

Retrieves a verification flow for email or account verification

Fetches verification flow data from Ory Kratos, which handles email and account
verification processes. Users receive verification links via email that include
the flow ID in the URL parameters.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<`VerificationFlow` \| `null`\>

Promise that resolves to a VerificationFlow object or null if the flow cannot be retrieved

#### Example

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

#### Since

0.5.1