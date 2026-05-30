---
title: Tenant Lifecycle
description: Create, manage, switch, and delete tenants
---

# Tenant Lifecycle

This guide covers creating tenants, switching between them, and handling tenant deletion.

## UI Components

OmniBase provides pre-built shadcn components for tenant management in `@omnibase/shadcn`:

#### TenantCreator Component

Create new organizations or join existing ones via invite token. Auto-detects `?invite_token=` from URL.

```tsx
import { TenantCreator } from '@omnibase/shadcn';

<TenantCreator
  config={{
    defaultMode: 'create',
    createOrganizationText: 'Create Organization',
    joinOrganizationText: 'Join Organization',
    createForm: {
      organizationName: { label: 'Organization Name', placeholder: 'Acme Inc' },
      billingEmail: { label: 'Billing Email', placeholder: 'billing@acme.com' },
    },
  }}
  formActions={{
    createOrganizationAction: async (formData) => {
      await tenantsApi.createTenant({
        createTenantRequest: {
          name: formData.get('organizationName') as string,
          billingEmail: formData.get('billingEmail') as string,
        },
      });
      redirect('/dashboard');
    },
    joinOrganizationAction: async (formData) => {
      await tenantsApi.acceptInvite({
        acceptInviteRequest: { token: formData.get('token') as string },
      });
      redirect('/dashboard');
    },
  }}
/>
```

**Props:**
- `config.defaultMode` — `'create'` or `'join'`
- `config.createForm` — Customize organization name and billing email inputs
- `config.joinForm` — Customize invite token input
- `formActions.createOrganizationAction` — Server action for creation
- `formActions.joinOrganizationAction` — Server action for joining

#### SwitchActiveTenant Component

Dropdown for switching between tenants with optional "Create Tenant" action.

```tsx
import { SwitchActiveTenant } from '@omnibase/shadcn';

<SwitchActiveTenant
  tenants={userTenants}
  currentTenantId={activeTenantId}
  placeholder="Select organization..."
  formAction={async (formData) => {
    'use server';
    await tenantsApi.switchActiveTenant({
      switchTenantRequest: { tenantId: formData.get('tenant_id') as string },
    });
    revalidatePath('/', 'layout');
  }}
  onCreateTenant={() => router.push('/onboarding')}
  createTenantLabel="Create Organization"
/>
```

**Props:**
- `tenants` — Array of `Tenant` objects
- `currentTenantId` — Currently active tenant ID
- `formAction` — Server action that receives `FormData` with `tenant_id`
- `onTenantChange` — Client-side callback for tenant changes
- `onCreateTenant` — Callback when "Create Tenant" is clicked
- `createTenantLabel` — Custom label for create option

## Creating Tenants

When you create a tenant, OmniBase automatically:

1. Creates the tenant record in the database
2. Creates a Stripe customer (if `billingEmail` is provided)
3. Assigns the creating user as `owner`
4. Clones role templates (`owner`, `admin`, `member`) for the tenant
5. Creates permission relationships for owner permissions
6. Generates a JWT token with the new tenant context
7. Sets this tenant as the user's active tenant

### Basic Creation

```typescript
import { Configuration, V1TenantsApi } from '@omnibase/core-js';

const config = new Configuration({
  basePath: process.env.OMNIBASE_API_URL,
});

const tenantsApi = new V1TenantsApi(config);

const { data } = await tenantsApi.createTenant({
  createTenantRequest: {
    name: 'Acme Corporation',
    billingEmail: 'billing@acme.com',
  },
});

console.log('Tenant ID:', data.data.tenant.id);
console.log('Stripe Customer:', data.data.tenant.stripe_customer_id);
console.log('JWT Token:', data.data.token);
```

---

## Listing Tenants

Users can belong to multiple tenants. List all tenants for the current user:

```typescript
import { V1AuthApi } from '@omnibase/core-js';

const authApi = new V1AuthApi(config);

const { data } = await authApi.listTenants();

for (const item of data.data.tenants) {
  console.log(`${item.tenant.name}: ${item.isActive ? 'ACTIVE' : ''}`);
  console.log(`  Role: ${item.role}`);
  console.log(`  Joined: ${item.joinedAt}`);
}
```

---

## Switching Tenants

The **active tenant** determines:

- Which data is visible (via RLS policies)
- Which Stripe customer is used for billing
- Which permissions are checked
- Which JWT claims are generated

### Switch Active Tenant

```typescript
await tenantsApi.switchActiveTenant({
  switchTenantRequest: {
    tenantId: 'tenant_abc123',
  },
});

// All subsequent requests use the new tenant context
```

> **Note:**
  When switching tenants, OmniBase updates the `is_active` flag in `tenant_users`, generates a new JWT token, and all subsequent database queries automatically filter by the new tenant.

### Get Active Tenant

```typescript
const { data } = await authApi.getActiveTenant();

console.log('Active Tenant:', data.data.tenant.name);
console.log('Your Role:', data.data.role);
```

### Tenant Switching in Next.js

**Server Action:**

```typescript
// app/actions.ts
'use server';

import { Configuration, V1TenantsApi } from '@omnibase/core-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function switchTenant(formData: FormData) {
  const tenantId = formData.get('tenant_id') as string;

  const config = new Configuration({
    basePath: process.env.OMNIBASE_API_URL,
    // Pass cookies for authentication
  });

  const tenantsApi = new V1TenantsApi(config);

  await tenantsApi.switchActiveTenant({
    switchTenantRequest: { tenantId },
  });

  // Revalidate to refresh data with new tenant context
  revalidatePath('/', 'layout');

  return { success: true };
}
```

**Client Component:**

```tsx
'use client';

import { switchTenant } from './actions';

export function TenantSwitcher({ tenants, currentTenantId }) {
  return (
    <form action={switchTenant}>
      <select name="tenant_id" defaultValue={currentTenantId}>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <button type="submit">Switch</button>
    </form>
  );
}
```

---

## Tenant Lookup

For service-to-service operations, you can look up tenants by ID or Stripe customer ID:

### By Tenant ID

```typescript
const { data } = await tenantsApi.getTenantByID({
  tenantId: 'tenant_abc123',
});

console.log('Tenant:', data.data.tenant.name);
```

### By Stripe Customer ID

Useful for Stripe webhook handlers:

```typescript
const { data } = await tenantsApi.getTenantByStripeCustomerID({
  stripeCustomerId: 'cus_abc123',
});

console.log('Tenant:', data.data.tenant.name);
```

> **Note:**
  Lookup endpoints require service key authentication (`X-Service-Key` header) and are intended for server-to-server use.

---

## Deleting Tenants

Only users with the `tenant#delete_tenant` permission (typically owners) can delete a tenant.

```typescript
await tenantsApi.deleteTenant();
```

### What Happens on Deletion

### Permission Check
OmniBase verifies the user has `tenant#delete_tenant` permission.

### Stripe Cleanup
If a Stripe customer exists, it's archived and subscriptions are cancelled.

### Database Cascade
All related records are deleted:
- `auth.tenants` (primary record)
- `auth.tenant_users` (all memberships)
- `auth.tenant_settings`
- `auth.tenant_invites` (pending invitations)
- All tenant-scoped data (via foreign key cascades)

### Permission Cleanup
All permission relationships for this tenant are deleted.

### User Reassignment
Former members are reassigned to another tenant (if they have one) or their identity metadata is updated.

> **Note:**
  Tenant deletion is irreversible. All data associated with the tenant will be permanently deleted.

---

## Tenant Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    TENANT CREATION                       │
├─────────────────────────────────────────────────────────┤
│  1. User calls createTenant()                           │
│  2. OmniBase creates tenant record                      │
│  3. Stripe customer created automatically               │
│  4. Creating user assigned as owner                     │
│  5. Permission relationship: user → owner → tenant      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    TENANT ACTIVE                         │
├─────────────────────────────────────────────────────────┤
│  • Members can be invited                               │
│  • Data is isolated via RLS                             │
│  • Subscriptions can be added                           │
│  • Billing goes to tenant's Stripe customer             │
│  • Users can switch between tenants                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    TENANT DELETION                       │
├─────────────────────────────────────────────────────────┤
│  1. Owner calls deleteTenant()                          │
│  2. All memberships removed                             │
│  3. Stripe subscriptions cancelled                      │
│  4. Data cascade deleted                                │
│  5. Permission relationships cleaned up                 │
└─────────────────────────────────────────────────────────┘
```

---

## Related Guides

- [Team Invitations](/guides/multi-tenancy/invitations) — Invite users to your tenant
- [RBAC](/guides/multi-tenancy/rbac) — Configure roles and permissions
- [Data Isolation](/guides/multi-tenancy/isolation) — How RLS protects tenant data
