# Type Alias: Tenant

> **Tenant** = `object`

Defined in: tenants/create-tenant.ts:63

Tenant entity structure that maps to the database schema

Represents a tenant in the multi-tenant system with billing integration
via Stripe. Each tenant can have multiple users with different roles
and maintains its own isolated data through RLS policies.

## Example

```typescript
const tenant: Tenant = {
  id: 'tenant_abc123',
  name: 'Acme Corporation',
  stripe_customer_id: 'cus_stripe123',
  type: 'business',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
};
```

## Since

1.0.0

## Properties

### created\_at

> **created\_at**: `string`

Defined in: tenants/create-tenant.ts:73

ISO 8601 timestamp when the tenant was created

***

### id

> **id**: `string`

Defined in: tenants/create-tenant.ts:65

Unique identifier for the tenant

***

### name

> **name**: `string`

Defined in: tenants/create-tenant.ts:67

Display name of the tenant organization

***

### stripe\_customer\_id

> **stripe\_customer\_id**: `string`

Defined in: tenants/create-tenant.ts:69

Associated Stripe customer ID for billing

***

### type

> **type**: `string`

Defined in: tenants/create-tenant.ts:71

Type of tenant (e.g., 'individual', 'organization')

***

### updated\_at

> **updated\_at**: `string`

Defined in: tenants/create-tenant.ts:75

ISO 8601 timestamp when the tenant was last updated
