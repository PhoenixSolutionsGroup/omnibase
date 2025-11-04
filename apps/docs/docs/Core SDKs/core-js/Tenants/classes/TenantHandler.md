# Class: TenantHandler

Defined in: [tenants/handler.ts:52](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/handler.ts#L52)

Main tenant management handler

This is the primary entry point for all tenant-related operations in the
Omnibase SDK. It provides a unified interface to tenant management,
user management, and invitation functionality through dedicated manager instances.

The handler follows the composition pattern, combining specialized managers
for different aspects of tenant functionality:
- `manage`: Core tenant operations (create, delete, switch)
- `invites`: User invitation management (create, accept)
- `user`: Tenant user operations (remove, update role)

All operations are performed within the context of the authenticated user
and respect tenant-level permissions and row-level security policies.

## Example

```typescript
import { OmnibaseClient } from '@omnibase/core-js';
import { TenantHandler } from '@omnibase/core-js/tenants';

const client = new OmnibaseClient({ apiKey: 'your-api-key' });
const tenantHandler = new TenantHandler(client);

// Create a new tenant
const tenant = await tenantHandler.manage.createTenant({
  name: 'My Company',
  billing_email: 'billing@company.com',
  user_id: 'user_123'
});

// Invite users to the tenant
const invite = await tenantHandler.invites.create({
  email: 'colleague@company.com',
  role: 'member',
  invite_url: 'https://yourapp.com/accept-invite'
});

// Switch to the new tenant
await tenantHandler.manage.switchActiveTenant(tenant.data.tenant.id);
```

## Since

0.6.0

## Tenant Management

### Constructor

> **new TenantHandler**(`omnibaseClient`): `TenantHandler`

Defined in: [tenants/handler.ts:73](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/handler.ts#L73)

Creates a new TenantHandler instance

Initializes the handler with the provided Omnibase client and sets up
the specialized manager instances for tenant and invitation operations.
The client is used for all underlying HTTP requests and authentication.

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured Omnibase client instance

#### Returns

`TenantHandler`

#### Example

```typescript
const client = new OmnibaseClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yourapp.com'
});
const tenantHandler = new TenantHandler(client);
```

***

### user

> `readonly` **user**: `TenantUserManager`

Defined in: [tenants/handler.ts:95](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/handler.ts#L95)

Tenant user management operations

Provides access to operations for managing users within tenants, including
removing users from the active tenant. All operations respect user permissions
and tenant ownership rules.

#### Example

```typescript
// Remove a user from the active tenant
await tenantHandler.user.remove({ user_id: 'user_123' });
```

#### Since

0.6.0

## Properties

### invites

> `readonly` **invites**: [`TenantInviteManager`](TenantInviteManager.md)

Defined in: [tenants/handler.ts:142](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/handler.ts#L142)

Tenant invitation management operations

Provides access to user invitation functionality including creating
invitations for new users and accepting existing invitations.
Supports role-based access control and secure token-based workflows.

#### Example

```typescript
// Create an invitation
const invite = await tenantHandler.invites.create({
  email: 'newuser@company.com',
  role: 'admin',
  invite_url: 'https://yourapp.com/accept-invite'
});

// Accept an invitation (from the invited user's session)
const result = await tenantHandler.invites.accept('invite_token_xyz');
```

***

### manage

> `readonly` **manage**: [`TenantManger`](TenantManger.md)

Defined in: [tenants/handler.ts:120](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/handler.ts#L120)

Core tenant management operations

Provides access to tenant lifecycle operations including creation,
deletion, and active tenant switching. All operations respect user
permissions and tenant ownership rules.

#### Example

```typescript
// Create a new tenant
const tenant = await tenantHandler.manage.createTenant({
  name: 'New Company',
  billing_email: 'billing@newcompany.com',
  user_id: 'user_456'
});

// Switch to the tenant
await tenantHandler.manage.switchActiveTenant(tenant.data.tenant.id);

// Delete the tenant (owner only)
await tenantHandler.manage.deleteTenant(tenant.data.tenant.id);
```
