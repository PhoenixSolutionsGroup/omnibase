# Function: createTenantAction()

> **createTenantAction**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Defined in: src/tenants/create-tenant.ts:98

Server Action to create a new tenant with authentication and redirect handling

## Parameters

### prevState

`any`

Previous action state (required for useActionState compatibility)

### formData

`FormData`

FormData containing the following required fields:
- `name` (string) - The tenant name
- `billing_email` (string) - Billing email for the tenant
- `user_id` (string) - ID of the user creating the tenant
- `callback_url` (string, optional) - Redirect URL after successful creation.
  If not provided, uses OMNIBASE_ONBOARDING_REDIRECT_URL environment variable

## Returns

`Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

On business/user errors, returns `{ success: false, error: string }`.
On success, redirects user to callback URL. Server/config errors throw exceptions.

## Example

```tsx
"use client"
import { useActionState } from "react"
import { createTenantAction } from "@omnibase/nextjs/tenants"

export function CreateTenantForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(createTenantAction, null)

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Tenant Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="billing_email">Billing Email</label>
        <input
          id="billing_email"
          name="billing_email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <input name="user_id" type="hidden" value={userId} />
      <input name="redirect_to" type="hidden" value="/dashboard" />

      {state?.error && (
        <div className="error" role="alert">
          {state.error}
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating Tenant..." : "Create Tenant"}
      </button>
    </form>
  )
}
```
