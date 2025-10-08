# Function: switchActiveTenantAction()

> **switchActiveTenantAction**(`formData`): `Promise`\<\{ `error`: `string`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Defined in: src/tenants/switch-tenant.ts:73

Next.js server action for switching the active tenant context

This server action handles switching the current user's active tenant context.
It validates the tenant ID from form data, calls the core API to switch tenants,
updates the JWT token in cookies with the new tenant context, and returns
a success or error response.

Unlike the delete tenant action, this action does not redirect and instead
returns a response object that can be used to update the UI state or handle
the tenant switch on the client side.

## Parameters

### formData

`FormData`

Form data containing the tenant_id field

## Returns

`Promise`\<\{ `error`: `string`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `error?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Promise resolving to success/error state object with tenant switch result

## Throws

When tenant_id is missing from form data

## Throws

When tenant switching fails or returns no data

## Throws

When any other error occurs during the process

## Example

Using with useActionState hook (React 19+):
```typescript
import { switchActiveTenantAction } from '@omnibase/nextjs/tenants';
import { useActionState } from 'react';

export default function TenantSwitcher({ tenantId }: { tenantId: string }) {
  const [state, action] = useActionState(
    switchActiveTenantAction,
    null
  );

  return (
    <form action={action}>
      <input type="hidden" name="tenant_id" value={tenantId} />
      <button type="submit" disabled={state?.pending}>
        {state?.pending ? 'Switching...' : 'Switch Tenant'}
      </button>

      {state?.success && (
        <p style={{ color: 'green' }}>{state.message}</p>
      )}
      {state?.error && (
        <p style={{ color: 'red' }}>{state.error}</p>
      )}
    </form>
  );
}
```

## Since

1.0.0
