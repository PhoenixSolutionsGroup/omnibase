# Class: TenantManagementManager

Defined in: [src/tenants/management.ts:42](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/management.ts#L42)

Manager for tenant lifecycle server actions

This class provides Next.js server actions for managing tenant operations including
creation, deletion, and switching between tenants. All methods are designed to work
seamlessly with Next.js forms and the React useActionState hook, handling form
validation, API communication, JWT token management in HTTP-only cookies, and
automatic redirects.

Each action follows a consistent pattern:
1. Extract and validate form data
2. Call the OmniBase API
3. Handle errors with user-friendly messages
4. Update JWT token in cookies (if applicable)
5. Redirect to success page or return error state

## Example

Using tenant management in a server component:
```typescript
import { omnibase } from '@/lib/omnibase-client';

export default async function TenantPage() {
  return (
    <div>
      <CreateTenantForm action={omnibase.tenants.manage.create} />
      <DeleteTenantButton action={omnibase.tenants.manage.delete} />
      <TenantSwitcher action={omnibase.tenants.manage.switch} />
    </div>
  );
}
```

## Since

0.5.1

## Server Actions

### create()

> **create**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Defined in: [src/tenants/management.ts:180](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/management.ts#L180)

Next.js server action for creating a new tenant

This server action handles the complete tenant creation workflow, including form
validation, API calls, Stripe billing setup, JWT token management, and redirection.
When a tenant is created, the user becomes the owner and receives a new JWT token
with the tenant context, which is automatically stored in HTTP-only cookies.

The action expects a FormData object with 'name', 'billing_email', and 'user_id'
fields, plus optionally a 'redirect_to' field. If no redirect URL is provided,
it will use the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.

#### Parameters

##### prevState

`any`

Previous state from useActionState hook (can be any type)

##### formData

`FormData`

Form data containing the following fields:
  - name (required): Display name for the tenant
  - billing_email (required): Email address for billing notifications
  - user_id (required): ID of the user creating the tenant (becomes owner)
  - redirect_to (optional): URL to redirect to after successful creation

#### Returns

`Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Promise that resolves to success/error state object, or redirects on success

#### Throws

When required fields (name, billing_email, user_id) are missing

#### Throws

When no redirect URL is available (form field or env var)

#### Throws

When tenant creation fails or returns no data

#### Throws

When any other error occurs during the process

#### Example

Using in a server component:
```typescript
// In your page.tsx (server component)
import { omnibase } from '@/lib/server';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
import { getServerSession } from '@omnibase/nextjs/auth';

const actions = new TenantActionsHandler(omnibase);

export default async function TenantsPage() {
  const session = await getServerSession();

  return (
    <CreateTenantForm
      action={async (prevState: any, formData: FormData) => {
        'use server';
        formData.set('user_id', session.identity?.id!);
        return actions.manage.create(prevState, formData);
      }}
    />
  );
}
```

#### Since

0.5.1

***

### delete()

> **delete**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Defined in: [src/tenants/management.ts:99](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/management.ts#L99)

Next.js server action for deleting a tenant

This server action handles the complete tenant deletion workflow, including
form validation, API calls, cookie management, and redirection. It permanently
removes a tenant and all associated data, clears the authentication token,
and redirects the user to a specified URL.

The action expects a FormData object with a 'tenant_id' field and optionally
a 'redirect_to' field. If no redirect URL is provided in the form, it will
use the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.

#### Parameters

##### prevState

`any`

Previous state from useFormState hook (can be any type)

##### formData

`FormData`

Form data containing tenant_id and optional redirect_to fields

#### Returns

`Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Promise that resolves to success/error state object, or redirects on success

#### Throws

When tenant_id is missing from form data

#### Throws

When no redirect URL is available (form field or env var)

#### Throws

When tenant deletion fails or returns no data

#### Throws

When any other error occurs during the process

#### Example

Using in a server component:
```typescript
// In your page.tsx (server component)
import { omnibase } from '@/lib/server';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';

const actions = new TenantActionsHandler(omnibase);

export default async function TenantsPage() {
  return (
    <DeleteTenantForm
      action={async (prevState: any, formData: FormData) => {
        'use server';
        return actions.manage.delete(prevState, formData);
      }}
    />
  );
}
```

#### Since

0.5.1

***

### switch()

> **switch**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/tenants/management.ts:251](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/management.ts#L251)

Next.js server action for switching the active tenant

This server action allows users to switch between tenants they belong to. It handles
the complete switching workflow including validation, API calls, and JWT token updates.
The new JWT token with the selected tenant context is automatically stored in cookies.

Unlike create and delete actions, this action does NOT redirect but returns a success
state, allowing you to handle the UI update (like closing a dropdown) before optionally
navigating to a different page.

#### Parameters

##### prevState

`any`

Previous state from useActionState hook (can be any type)

##### formData

`FormData`

Form data containing the following field:
  - tenant_id (required): ID of the tenant to switch to

#### Returns

`Promise`\<\{ `error`: `string`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Promise resolving to success/error state object with either a success message or error message

#### Throws

When tenant_id is missing from form data

#### Throws

When tenant switching fails or returns no data

#### Throws

When any other error occurs during the process

#### Example

Using in a server component:
```typescript
// In your page.tsx (server component)
import { omnibase } from '@/lib/server';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';

const actions = new TenantActionsHandler(omnibase);

export default async function TenantsPage() {
  return (
    <SwitchTenantForm
      action={async (prevState: any, formData: FormData) => {
        'use server';
        return actions.manage.switch(prevState, formData);
      }}
    />
  );
}
```

#### Since

0.5.1

## Tenant Management

### Constructor

> **new TenantManagementManager**(`omnibaseClient`): `TenantManagementManager`

Defined in: [src/tenants/management.ts:50](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/management.ts#L50)

Creates a new tenant management manager

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured OmnibaseClient instance for API communication

#### Returns

`TenantManagementManager`
