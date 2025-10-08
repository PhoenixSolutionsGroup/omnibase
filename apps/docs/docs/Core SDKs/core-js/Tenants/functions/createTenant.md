# Function: createTenant()

> **createTenant**(`tenantData`): `Promise`\<[`CreateTenantResponse`](../type-aliases/CreateTenantResponse.md)\>

Defined in: tenants/create-tenant.ts:149

Creates a new tenant in the multi-tenant system

Establishes a new tenant with integrated Stripe billing setup and assigns
the specified user as the tenant owner. The operation creates the necessary
database records and returns a JWT token that enables Row-Level Security
access to the tenant's isolated data.

The function automatically handles Stripe customer creation for billing
integration and sets up the initial tenant configuration. The returned
token should be stored securely for subsequent API calls.

## Parameters

### tenantData

[`CreateTenantRequest`](../type-aliases/CreateTenantRequest.md)

Configuration object for the new tenant

## Returns

`Promise`\<[`CreateTenantResponse`](../type-aliases/CreateTenantResponse.md)\>

Promise resolving to the created tenant with authentication token

## Throws

When OMNIBASE_API_URL environment variable is not configured

## Throws

When required fields (name, user_id) are missing or empty

## Throws

When the API request fails due to network issues

## Throws

When the server returns an error response (4xx, 5xx status codes)

## Example

Basic tenant creation:
```typescript
const newTenant = await createTenant({
  name: 'Acme Corporation',
  billing_email: 'billing@acme.com',
  user_id: 'user_123'
});

console.log(`Created tenant: ${newTenant.data.tenant.name}`);
// Store the token for authenticated requests
localStorage.setItem('tenant_token', newTenant.data.token);
```

## Since

1.0.0
