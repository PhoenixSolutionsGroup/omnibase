# Type Alias: FlowMap

> **FlowMap** = `object`

Defined in: src/auth/flow-router.ts:21

Maps auth flow types to their corresponding React component functions

## Properties

### login()?

> `optional` **login**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:23

Function that takes a LoginFlow and returns a component

#### Parameters

##### flow

`LoginFlow`

#### Returns

`ReactNode`

***

### onboarding()?

> `optional` **onboarding**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:33

Function that takes any flow object and returns a component (for onboarding)

#### Parameters

##### flow

`any`

#### Returns

`ReactNode`

***

### recovery()?

> `optional` **recovery**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:27

Function that takes a RecoveryFlow and returns a component

#### Parameters

##### flow

`RecoveryFlow`

#### Returns

`ReactNode`

***

### registration()?

> `optional` **registration**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:25

Function that takes a RegistrationFlow and returns a component

#### Parameters

##### flow

`RegistrationFlow`

#### Returns

`ReactNode`

***

### settings()?

> `optional` **settings**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:31

Function that takes a SettingsFlow and returns a component

#### Parameters

##### flow

`SettingsFlow`

#### Returns

`ReactNode`

***

### verification()?

> `optional` **verification**: (`flow`) => `ReactNode`

Defined in: src/auth/flow-router.ts:29

Function that takes a VerificationFlow and returns a component

#### Parameters

##### flow

`VerificationFlow`

#### Returns

`ReactNode`
