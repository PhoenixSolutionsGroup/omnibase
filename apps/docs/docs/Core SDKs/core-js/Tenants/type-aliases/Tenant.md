# Type Alias: Tenant

> **Tenant** = `object`

Defined in: [tenants/management.ts:124](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L124)

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

0.6.0

## Properties

### created\_at

> **created\_at**: `string`

Defined in: [tenants/management.ts:134](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L134)

ISO 8601 timestamp when the tenant was created

***

### id

> **id**: `string`

Defined in: [tenants/management.ts:126](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L126)

Unique identifier for the tenant

***

### name

> **name**: `string`

Defined in: [tenants/management.ts:128](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L128)

Display name of the tenant organization

***

### stripe\_customer\_id

> **stripe\_customer\_id**: `string`

Defined in: [tenants/management.ts:130](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L130)

Associated Stripe customer ID for billing

***

### type

> **type**: `string`

Defined in: [tenants/management.ts:132](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L132)

Type of tenant (e.g., 'individual', 'organization')

***

### updated\_at

> **updated\_at**: `string`

Defined in: [tenants/management.ts:136](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L136)

ISO 8601 timestamp when the tenant was last updated
