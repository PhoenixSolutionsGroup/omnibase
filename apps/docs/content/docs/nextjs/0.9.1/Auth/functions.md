---
title: "Functions"
---

# Functions

### clearSessionToken()

```ts
function clearSessionToken(): Promise<void>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:40](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L40)

#### Returns

`Promise`\<`void`\>

***

### createSessionTokenExchangeHandler()

```ts
function createSessionTokenExchangeHandler(__namedParameters): (req) => Promise<Response>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:114](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L114)

Route handler for the social sign-in callback. Mount it at the path passed
to `LoginForm`'s `return_to` (default `/auth/callback`). It exchanges the
session token exchange codes delivered after a social sign-in and stores
the resulting session token in the first-party cookie.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `api_url`: `string`; `cookie_domain?`: `string`; `login_path?`: `string`; `success_path?`: `string`; \} |
| `__namedParameters.api_url` | `string` |
| `__namedParameters.cookie_domain?` | `string` |
| `__namedParameters.login_path?` | `string` |
| `__namedParameters.success_path?` | `string` |

#### Returns

```ts
(req): Promise<Response>;
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `req` | `Request` |

##### Returns

`Promise`\<`Response`\>

***

### exchangeSessionToken()

```ts
function exchangeSessionToken(initCode, returnToCode): Promise<string | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:81](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L81)

Exchanges the two session token exchange codes (one from the flow
initialization, one from the `return_to` redirect) for a session token.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initCode` | `string` |
| `returnToCode` | `string` |

#### Returns

`Promise`\<`string` \| `null`\>

***

### getSessionConfiguration()

```ts
function getSessionConfiguration(): Promise<Configuration>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L50)

Configuration that authenticates API calls with the session token
(`X-Session-Token`), falling back to cookies when no token is present.

#### Returns

`Promise`\<`Configuration`\>

***

### getSessionToken()

```ts
function getSessionToken(): Promise<string | undefined>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:24](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L24)

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### getTokenSession()

```ts
function getTokenSession(): Promise<Session | null>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:64](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L64)

Validates the session token against the OmniBase API and returns the
underlying Kratos session, or null when there is no token or it is invalid.

#### Returns

`Promise`\<`Session` \| `null`\>

***

### setSessionToken()

```ts
function setSessionToken(token, cookieDomain?): Promise<void>;
```

Defined in: [sdk/framework/nextjs/src/auth/session.ts:29](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f1549e15f0a8f8a079339c9821697272dc51101c/sdk/framework/nextjs/src/auth/session.ts#L29)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |
| `cookieDomain?` | `string` |

#### Returns

`Promise`\<`void`\>