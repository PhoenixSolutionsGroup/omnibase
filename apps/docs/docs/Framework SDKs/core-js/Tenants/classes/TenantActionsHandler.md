# Class: TenantActionsHandler

Defined in: [src/tenants/handler.ts:43](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/handler.ts#L43)

Main handler for tenant-related server actions

This class serves as the entry point for all tenant operations in Next.js server
components and server actions. It provides access to tenant management operations
(create, delete, switch) and invitation handling through organized sub-managers.

The handler is designed to work seamlessly with Next.js server actions and the
React useActionState hook, providing automatic form validation, cookie management,
and redirection handling.

## Example

Using the tenant handler in a server component:
```typescript
import { omnibase } from '@/lib/omnibase-client';

export default async function TenantManagementPage() {
  // Access tenant management actions
  const createAction = omnibase.tenants.manage.create;
  const switchAction = omnibase.tenants.manage.switch;

  // Access invitation actions
  const acceptInviteAction = omnibase.tenants.invites.accept;

  return (
    <div>
      <CreateTenantForm action={createAction} />
      <TenantSwitcher action={switchAction} />
    </div>
  );
}
```

## Since

0.5.1

## Tenant Handler

### Constructor

> **new TenantActionsHandler**(`omnibaseClient`): `TenantActionsHandler`

Defined in: [src/tenants/handler.ts:80](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/handler.ts#L80)

Creates a new tenant actions handler

This constructor initializes the handler with an OmnibaseClient instance,
which is used to communicate with the OmniBase API for all tenant operations.
The handler creates sub-managers for different tenant operation categories.

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured OmnibaseClient instance with API credentials

#### Returns

`TenantActionsHandler`

#### Example

```typescript
// In your server-side lib file (e.g., lib/server.ts)
import { OmnibaseClient } from '@omnibase/core-js';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
import { cookies } from 'next/headers';

const omnibase = new OmnibaseClient({
  api_url: process.env.OMNIBASE_API_URL!,
  fetch: async (endpoint, options) => {
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    return fetch(endpoint, {
      ...options,
      credentials: 'include',
      headers: { Cookie: cookieHeader, ...options.headers }
    });
  }
});

const tenantActions = new TenantActionsHandler(omnibase);
```

***

### invites

> **invites**: [`TenantInviteManager`](TenantInviteManager.md)

Defined in: [src/tenants/handler.ts:141](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/handler.ts#L141)

Tenant invitation operations manager

Provides access to server actions for handling tenant invitations,
including accepting invites with secure token validation.

#### Example

```typescript
// Accept a tenant invitation
const acceptAction = tenantHandler.invites.accept;
```

***

### manage

> **manage**: [`TenantManagementManager`](TenantManagementManager.md)

Defined in: [src/tenants/handler.ts:125](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/handler.ts#L125)

Tenant management operations manager

Provides access to server actions for creating, deleting, and switching
between tenants. All methods are designed to work with Next.js forms and
the useActionState hook.

#### Example

```typescript
// Create a new tenant
const createAction = tenantHandler.manage.create;

// Delete a tenant
const deleteAction = tenantHandler.manage.delete;

// Switch active tenant
const switchAction = tenantHandler.manage.switch;
```

***

### user

> **user**: `TenantUserManager`

Defined in: [src/tenants/handler.ts:102](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/handler.ts#L102)

Tenant user management operations manager

Provides access to server actions for managing users within tenants,
including removing users from the active tenant. All methods are designed
to work with Next.js forms and the useActionState hook.

#### Example

```typescript
// Remove a user from the active tenant
const removeUserAction = tenantHandler.user.remove;
```

#### Since

0.5.1
