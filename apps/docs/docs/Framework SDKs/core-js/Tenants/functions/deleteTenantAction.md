# Function: deleteTenantAction()

> **deleteTenantAction**(`prevState`, `formData`): `Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Defined in: src/tenants/delete-tenant.ts:118

Next.js server action for deleting a tenant

This server action handles the complete tenant deletion workflow, including
form validation, API calls, cookie management, and redirection. It permanently
removes a tenant and all associated data, clears the authentication token,
and redirects the user to a specified URL.

The action expects a FormData object with a 'tenant_id' field and optionally
a 'redirect_to' field. If no redirect URL is provided in the form, it will
use the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.

## Parameters

### prevState

`any`

Previous state from useFormState hook (can be any type)

### formData

`FormData`

Form data containing tenant_id and optional redirect_to fields

## Returns

`Promise`\<\{ `error`: `string`; `success`: `boolean`; \}\>

Promise that resolves to success/error state object, or redirects on success

## Throws

When tenant_id is missing from form data

## Throws

When no redirect URL is available (form field or env var)

## Throws

When tenant deletion fails or returns no data

## Throws

When any other error occurs during the process

## Examples

Basic usage in a Next.js form:
```typescript
import { deleteTenantAction } from '@omnibase/nextjs/tenants';
import { useFormState } from 'react-dom';

export default function DeleteTenantForm({ tenantId }: { tenantId: string }) {
  const [state, formAction] = useFormState(deleteTenantAction, null);

  // Form should include:
  // - hidden input with name="tenant_id" value={tenantId}
  // - hidden input with name="redirect_to" value="/dashboard"
  // - submit button
  // - error display: {state?.error && <p>Error: {state.error}</p>}
}
```

Using environment variable for redirect:
```typescript
// Set OMNIBASE_DELETE_TENANT_REDIRECT_URL=/tenants in your environment

export default function DeleteTenantForm({ tenantId }: { tenantId: string }) {
  const [state, formAction] = useFormState(deleteTenantAction, null);

  // Form only needs tenant_id field - redirect URL comes from env var
}
```

Programmatic usage:
```typescript
import { deleteTenantAction } from '@omnibase/nextjs/tenants';

async function handleDeleteTenant(tenantId: string) {
  const formData = new FormData();
  formData.append('tenant_id', tenantId);
  formData.append('redirect_to', '/dashboard');

  try {
    await deleteTenantAction(null, formData);
    // Will redirect on success
  } catch (error) {
    console.error('Failed to delete tenant:', error);
  }
}
```

## Since

1.0.0
