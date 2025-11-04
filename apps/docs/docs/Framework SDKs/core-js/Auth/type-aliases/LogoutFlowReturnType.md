# Type Alias: LogoutFlowReturnType

> **LogoutFlowReturnType** = `object`

Defined in: [src/auth/get-flow.ts:287](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L287)

Return type for the getLogoutFlow function

Contains both the logout flow data and a server action for executing
the logout process, including clearing all authentication cookies.

## Since

0.5.1

## Properties

### action()

> **action**: () => `Promise`\<`void`\>

Defined in: [src/auth/get-flow.ts:291](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L291)

Server action that clears authentication cookies and completes logout

#### Returns

`Promise`\<`void`\>

***

### flow

> **flow**: `LogoutFlow`

Defined in: [src/auth/get-flow.ts:289](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/get-flow.ts#L289)

Logout flow object from Ory Kratos containing logout URL and token
