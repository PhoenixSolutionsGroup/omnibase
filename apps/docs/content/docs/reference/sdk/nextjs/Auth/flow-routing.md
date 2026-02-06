---
title: "Flow Routing"
---

# Flow Routing

Components and utilities for handling Ory Kratos authentication flows
including login, registration, recovery, verification, and settings.

### FlowRouterProps

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:140](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L140)

Props for the FlowRouter component

Configuration object for the FlowRouter component that handles dynamic
authentication flow routing in Next.js applications.

#### Since

0.5.1

#### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="flowmap"></a> `flowMap` | [`FlowMap`](#flowmap-1) | `undefined` | Map of flow types to their corresponding React component render functions | [sdk/framework/nextjs/src/auth/flow-router.ts:144](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L144) |
| <a id="onnotfound"></a> `onNotFound?` | `ReactNode` | `undefined` | Component to render when the requested flow type is not found or not supported | [sdk/framework/nextjs/src/auth/flow-router.ts:146](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L146) |
| <a id="params"></a> `params` | `Promise`\<\{ `flow`: `string`[]; \}\> | `undefined` | Next.js params promise containing the flow type from dynamic route segments | [sdk/framework/nextjs/src/auth/flow-router.ts:142](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L142) |
| <a id="returnto"></a> `returnTo?` | `string` | `"/"` | URL to redirect to after flow completion | [sdk/framework/nextjs/src/auth/flow-router.ts:155](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L155) |
| <a id="searchparams"></a> `searchParams` | `Promise`\<\{ \[`key`: `string`\]: `string` \| `string`[] \| `undefined`; \}\> | `undefined` | Promise resolving to search parameters from the request URL | [sdk/framework/nextjs/src/auth/flow-router.ts:150](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L150) |
| <a id="url"></a> `url` | `string` | `undefined` | Base URL path for authentication flows (e.g., '/auth') | [sdk/framework/nextjs/src/auth/flow-router.ts:148](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L148) |

***

### FlowMap

```ts
type FlowMap = {
  error?: (error) => ReactNode;
  login?: (flow) => ReactNode;
  onboarding?: (flow) => ReactNode;
  recovery?: (flow) => ReactNode;
  registration?: (flow) => ReactNode;
  settings?: (flow) => ReactNode;
  verification?: (flow) => ReactNode;
};
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:43](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L43)

Maps auth flow types to their corresponding React component functions

This type defines the structure for mapping authentication flow types to render functions.
Each property represents a different authentication flow, and its value is a function that
receives the flow data and returns a React component to render.

#### Example

```typescript
const flowMap: FlowMap = {
  login: (flow) => <LoginForm flow={flow} />,
  registration: (flow) => <RegisterForm flow={flow} />,
  recovery: (flow) => <RecoveryForm flow={flow} />
};
```

#### Since

0.5.1

#### Properties

##### error()?

```ts
optional error: (error) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:57](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L57)

Function that takes a FlowError and returns a component for displaying authentication errors

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | [`FlowError`](#flowerror) |

###### Returns

`ReactNode`

##### login()?

```ts
optional login: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:45](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L45)

Function that takes a LoginFlow and returns a component for user authentication

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `LoginFlow` |

###### Returns

`ReactNode`

##### onboarding()?

```ts
optional onboarding: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:55](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L55)

Function that takes any flow object and returns a component for custom onboarding

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `any` |

###### Returns

`ReactNode`

##### recovery()?

```ts
optional recovery: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:49](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L49)

Function that takes a RecoveryFlow and returns a component for password recovery

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `RecoveryFlow` |

###### Returns

`ReactNode`

##### registration()?

```ts
optional registration: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:47](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L47)

Function that takes a RegistrationFlow and returns a component for user registration

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `RegistrationFlow` |

###### Returns

`ReactNode`

##### settings()?

```ts
optional settings: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:53](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L53)

Function that takes a SettingsFlow and returns a component for user settings management

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `SettingsFlow` |

###### Returns

`ReactNode`

##### verification()?

```ts
optional verification: (flow) => ReactNode;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:51](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L51)

Function that takes a VerificationFlow and returns a component for email/account verification

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `flow` | `VerificationFlow` |

###### Returns

`ReactNode`

***

### FlowObject

```ts
type FlowObject = 
  | LoginFlow
  | RecoveryFlow
  | RegistrationFlow
  | SettingsFlow
  | VerificationFlow;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:70](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L70)

Union type for all possible flow objects

Represents any valid authentication flow object that can be returned
by the Ory Kratos authentication system.

#### Since

0.5.1

***

### FlowRouter()

```ts
function FlowRouter(props): Promise<
  | ReactElement<unknown, string | JSXElementConstructor<any>>
  | Iterable<ReactNode, any, any>
| AwaitedReactNode>;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:213](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L213)

Routes authentication flows to their corresponding components based on URL parameters

FlowRouter is a server component that dynamically renders the appropriate authentication
UI based on the URL path. It fetches the flow data from Ory Kratos and passes it to
the corresponding render function from the flowMap. This component is designed for
Next.js 13+ App Router with catch-all routes.

The router extracts the flow type from the URL (e.g., `/auth/login` → `login`),
retrieves the flow object, and invokes the matching render function with the flow data.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`FlowRouterProps`](#flowrouterprops) | Configuration props for the router |

#### Returns

`Promise`\<
  \| `ReactElement`\<`unknown`, string \| JSXElementConstructor\<any\>\>
  \| `Iterable`\<`ReactNode`, `any`, `any`\>
  \| `AwaitedReactNode`\>

Promise resolving to the rendered component for the current flow

#### Example

```tsx
// In your app/auth/[...flow]/page.tsx
import { FlowRouter } from '@omnibase/nextjs/auth';
import { LoginForm, RegistrationForm, RecoveryForm } from '@omnibase/shadcn';

export default function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ flow: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <FlowRouter
      params={params}
      searchParams={searchParams}
      url="/auth"
      returnTo="/"
      flowMap={{
        login: (flow) => <LoginForm flow={flow} register_url="/auth/registration" />,
        registration: (flow) => <RegistrationForm flow={flow} login_url="/auth/login" />,
        recovery: (flow) => <RecoveryForm flow={flow} />,
      }}
      onNotFound={<div>Authentication flow not supported</div>}
    />
  );
}
```

#### Since

0.5.1

***

### getFlow()

```ts
function getFlow(flowType, props): Promise<FlowObject | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/flow-router.ts:108](https://github.com/PhoenixSolutionsGroup/omnibase/blob/1386b8ddfb091a474ca71b03cebc423aa48783d7/sdk/framework/nextjs/src/auth/flow-router.ts#L108)

Retrieves the appropriate flow object based on the flow type

This function acts as a router for authentication flows, delegating to the
appropriate flow retrieval function based on the flow type. It's used internally
by FlowRouter but can also be used independently for custom flow handling.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `flowType` | keyof [`FlowMap`](#flowmap-1) | The type of flow to retrieve (login, registration, recovery, verification, settings, onboarding) |
| `props` | [`GetFlowProps`](#getflowprops) | Configuration object containing URL and search parameters |

#### Returns

`Promise`\<[`FlowObject`](#flowobject) \| `null`\>

Promise that resolves to the corresponding flow object or null if not found/supported

#### Example

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

#### Since

0.5.1