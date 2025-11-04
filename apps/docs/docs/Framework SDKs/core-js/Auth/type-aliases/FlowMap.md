# Type Alias: FlowMap

> **FlowMap** = `object`

Defined in: [src/auth/flow-router.ts:38](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L38)

Maps auth flow types to their corresponding React component functions

This type defines the structure for mapping authentication flow types to render functions.
Each property represents a different authentication flow, and its value is a function that
receives the flow data and returns a React component to render.

## Example

```typescript
const flowMap: FlowMap = {
  login: (flow) => <LoginForm flow={flow} />,
  registration: (flow) => <RegisterForm flow={flow} />,
  recovery: (flow) => <RecoveryForm flow={flow} />
};
```

## Since

0.5.1

## Properties

### login()?

> `optional` **login**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:40](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L40)

Function that takes a LoginFlow and returns a component for user authentication

#### Parameters

##### flow

`LoginFlow`

#### Returns

`ReactNode`

***

### onboarding()?

> `optional` **onboarding**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L50)

Function that takes any flow object and returns a component for custom onboarding

#### Parameters

##### flow

`any`

#### Returns

`ReactNode`

***

### recovery()?

> `optional` **recovery**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:44](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L44)

Function that takes a RecoveryFlow and returns a component for password recovery

#### Parameters

##### flow

`RecoveryFlow`

#### Returns

`ReactNode`

***

### registration()?

> `optional` **registration**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:42](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L42)

Function that takes a RegistrationFlow and returns a component for user registration

#### Parameters

##### flow

`RegistrationFlow`

#### Returns

`ReactNode`

***

### settings()?

> `optional` **settings**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:48](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L48)

Function that takes a SettingsFlow and returns a component for user settings management

#### Parameters

##### flow

`SettingsFlow`

#### Returns

`ReactNode`

***

### verification()?

> `optional` **verification**: (`flow`) => `ReactNode`

Defined in: [src/auth/flow-router.ts:46](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L46)

Function that takes a VerificationFlow and returns a component for email/account verification

#### Parameters

##### flow

`VerificationFlow`

#### Returns

`ReactNode`
