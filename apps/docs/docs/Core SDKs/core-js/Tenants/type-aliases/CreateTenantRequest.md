# Type Alias: CreateTenantRequest

> **CreateTenantRequest** = `object`

Defined in: [tenants/management.ts:158](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L158)

Required data for creating a new tenant

Contains the essential information needed to establish a new tenant
in the system, including billing setup and initial user assignment.

## Example

```typescript
const tenantData: CreateTenantRequest = {
  name: 'My New Company',
  billing_email: 'billing@mynewcompany.com',
  user_id: 'user_abc123'
};
```

## Since

0.6.0

## Properties

### billing\_email

> **billing\_email**: `string`

Defined in: [tenants/management.ts:162](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L162)

Email address for billing notifications

***

### name

> **name**: `string`

Defined in: [tenants/management.ts:160](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L160)

Name of the tenant organization

***

### user\_id

> **user\_id**: `string`

Defined in: [tenants/management.ts:164](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/tenants/management.ts#L164)

ID of the user who will own the tenant
