# Class: TenantInviteManager

Defined in: [src/tenants/invites.ts:21](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/invites.ts#L21)

Manager for tenant invitation server actions

This class provides Next.js server actions for handling tenant invitations,
including secure token validation, JWT token management, and automatic redirects.
It integrates seamlessly with Next.js forms and the React useActionState hook.

The invitation system allows users to be invited to existing tenants via a secure
token. When a user accepts an invitation, they are added to the tenant and receive
a new JWT token with the appropriate tenant context, which is automatically stored
in HTTP-only cookies.

## Since

0.5.1

## Tenant Invitations

### Constructor

> **new TenantInviteManager**(`omnibaseClient`): `TenantInviteManager`

Defined in: [src/tenants/invites.ts:29](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/invites.ts#L29)

Creates a new tenant invite manager

#### Parameters

##### omnibaseClient

`OmnibaseClient`

Configured OmnibaseClient instance for API communication

#### Returns

`TenantInviteManager`

***

### accept()

> **accept**(`prevState`, `formData`): `Promise`\<`undefined` \| \{ `error`: `string`; `success`: `boolean`; \}\>

Defined in: [src/tenants/invites.ts:81](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/invites.ts#L81)

Next.js server action for accepting a tenant invitation

This server action handles the complete invitation acceptance workflow, including
token validation, API calls, JWT token storage in cookies, and redirection. When
a user accepts an invitation, they are added to the tenant and receive a new
authentication token with the tenant context.

The action expects a FormData object with a 'token' field (the secure invitation
token) and optionally a 'redirect_to' field. If no redirect URL is provided in
the form, it will use the OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL environment
variable.

#### Parameters

##### prevState

`any`

Previous state from useActionState hook (can be any type)

##### formData

`FormData`

Form data containing the following fields:
  - token (required): The secure invitation token received via email or link
  - redirect_to (optional): URL to redirect to after successful acceptance

#### Returns

`Promise`\<`undefined` \| \{ `error`: `string`; `success`: `boolean`; \}\>

Promise that resolves to success/error state object, or redirects on success

#### Throws

When token is missing from form data

#### Throws

When no redirect URL is available (form field or env var)

#### Throws

When invitation acceptance fails or returns no data

#### Throws

When any other error occurs during the process

#### Example

Using in a server component:
```typescript
// In your page.tsx (server component)
import { omnibase } from '@/lib/server';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';

const actions = new TenantActionsHandler(omnibase);

export default async function AcceptInvitePage() {
  return (
    <AcceptInviteForm
      action={async (prevState: any, formData: FormData) => {
        'use server';
        return actions.invites.accept(prevState, formData);
      }}
    />
  );
}
```

#### Since

0.5.1

***

### create()

> **create**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `success`: `boolean`; \}\>

Defined in: [src/tenants/invites.ts:151](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/tenants/invites.ts#L151)

Next.js server action for creating a tenant invitation

This server action creates a new invitation for a user to join the active tenant.
An email notification is automatically sent to the invited user with a secure
invitation link. The action validates all required fields and returns success/error
state suitable for use with React's useActionState hook.

#### Parameters

##### prevState

`any`

Previous state from useActionState hook (can be any type)

##### formData

`FormData`

Form data containing the following fields:
  - email (required): Email address of the user being invited
  - role (required): Role to assign to the invited user (e.g., 'admin', 'member')
  - invite_url (required): Base URL for the invitation acceptance page

#### Returns

`Promise`\<\{ `error`: `string`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `success`: `boolean`; \}\>

Promise resolving to success/error state object

#### Throws

When required fields (email, role, invite_url) are missing

#### Throws

When the invitation creation fails or API returns an error

#### Example

Using in a server component:
```typescript
// In your page.tsx (server component)
import { omnibase } from '@/lib/server';
import { TenantActionsHandler } from '@omnibase/nextjs/tenants';

const actions = new TenantActionsHandler(omnibase);

export default async function TenantsPage() {
  return (
    <CreateInviteForm
      action={async (prevState: any, formData: FormData) => {
        'use server';
        formData.set('invite_url', process.env.NEXT_PUBLIC_WEBSITE_URL! + '/auth/onboarding');
        return actions.invites.create(prevState, formData);
      }}
    />
  );
}
```

#### Since

0.5.1
