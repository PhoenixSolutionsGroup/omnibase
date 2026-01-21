---
title: "Middleware"
---

# Middleware

Next.js middleware module for OmniBase

This module provides Next.js middleware functionality for seamless integration
with the OmniBase authentication and tenant management systems. It combines
Ory Kratos authentication, tenant membership validation, and PostgREST JWT
management into a single, easy-to-configure middleware solution.

Key features:
- **Authentication**: Ory Kratos integration with automatic session management
- **Tenant Validation**: Configurable tenant membership checking for protected routes
- **PostgREST JWT**: Automatic JWT token management for direct database access
- **Cookie Management**: Secure handling of authentication and database access tokens
- **Path Matching**: Flexible path patterns with exact, prefix, and wildcard support
- **Redirects**: Automatic redirection for users without tenant access

The middleware operates in a pipeline, first validating tenant membership (if
enabled), then ensuring PostgREST JWT tokens are available, and finally delegating
to Ory middleware for authentication. All cookies are properly merged and forwarded
in the response.

## Example

```typescript
// middleware.ts - Basic setup at the root of your Next.js project
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export const middleware = createOmniBaseMiddleware(
  process.env.NEXT_PUBLIC_OMNIBASE_API_URL!
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

## Since

0.5.1

## Middleware

### OmnibaseMiddlewareConfig

```ts
type OmnibaseMiddlewareConfig = {
  tenant_check: boolean;
  tenant_check_paths: string[];
  tenant_check_redirect_url: string;
};
```

Defined in: [sdk/framework/nextjs/src/middleware/middleware.ts:28](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f244ac2a69f3a69421ae3445d087131f00d1e3e8/sdk/framework/nextjs/src/middleware/middleware.ts#L28)

Configuration options for the OmniBase middleware

This interface defines the configuration for tenant checking behavior
in the Next.js middleware. It controls whether tenant validation is
enabled, which paths require tenant membership, and where to redirect
users who are not part of a tenant.

#### Example

```typescript
const config: OmnibaseMiddlewareConfig = {
  tenant_check: true,
  tenant_check_paths: ['/dashboard/*', '/settings'],
  tenant_check_redirect_url: '/onboarding'
};
```

#### Since

0.5.1

#### Properties

##### tenant\_check

```ts
tenant_check: boolean;
```

Defined in: [sdk/framework/nextjs/src/middleware/middleware.ts:33](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f244ac2a69f3a69421ae3445d087131f00d1e3e8/sdk/framework/nextjs/src/middleware/middleware.ts#L33)

Enable or disable tenant membership checking

###### Default Value

```ts
true
```

##### tenant\_check\_paths

```ts
tenant_check_paths: string[];
```

Defined in: [sdk/framework/nextjs/src/middleware/middleware.ts:40](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f244ac2a69f3a69421ae3445d087131f00d1e3e8/sdk/framework/nextjs/src/middleware/middleware.ts#L40)

Array of path patterns that require tenant membership
Supports exact matches and wildcard patterns (e.g., '/dashboard/*')

###### Default Value

```ts
['/']
```

##### tenant\_check\_redirect\_url

```ts
tenant_check_redirect_url: string;
```

Defined in: [sdk/framework/nextjs/src/middleware/middleware.ts:46](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f244ac2a69f3a69421ae3445d087131f00d1e3e8/sdk/framework/nextjs/src/middleware/middleware.ts#L46)

URL to redirect users who are not part of a tenant

###### Default Value

```ts
'/auth/onboarding'
```

***

### createOmniBaseMiddleware()

```ts
function createOmniBaseMiddleware(api_url, config): (req) => Promise<NextResponse<unknown>>;
```

Defined in: [sdk/framework/nextjs/src/middleware/middleware.ts:101](https://github.com/PhoenixSolutionsGroup/omnibase/blob/f244ac2a69f3a69421ae3445d087131f00d1e3e8/sdk/framework/nextjs/src/middleware/middleware.ts#L101)

Creates a Next.js middleware function with authentication and tenant checking

This middleware combines Ory authentication with OmniBase tenant validation
and PostgREST JWT management. It intercepts incoming requests to verify user
authentication via Ory, optionally checks if authenticated users belong to a
tenant, and ensures PostgREST JWT tokens are available for database access.

The middleware performs the following operations in order:
1. Retrieves the current user session
2. Validates tenant membership for configured paths (if enabled)
3. Ensures PostgREST JWT token is available for database access
4. Delegates remaining authentication to Ory middleware
5. Merges cookies from all middleware operations

Path matching supports both exact matches and wildcard patterns:
- Exact: '/dashboard' matches only '/dashboard'
- Prefix: '/dashboard' also matches '/dashboard/settings'
- Wildcard: '/api/*' matches all paths starting with '/api/'

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `api_url` | `string` | `undefined` | The OmniBase API URL (typically from NEXT_PUBLIC_OMNIBASE_API_URL) |
| `config` | [`OmnibaseMiddlewareConfig`](#omnibasemiddlewareconfig) | `defaultConfig` | Configuration object for middleware behavior (optional) |

#### Returns

Next.js middleware function that can be exported from middleware.ts

```ts
(req): Promise<NextResponse<unknown>>;
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `req` | `NextRequest` |

##### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

#### Example

```typescript
// middleware.ts - Basic usage with default configuration
import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';

export const middleware = createOmniBaseMiddleware(
  process.env.NEXT_PUBLIC_OMNIBASE_API_URL!
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

#### Since

0.5.1
