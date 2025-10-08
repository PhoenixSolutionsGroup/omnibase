# Type Alias: CreateTenantRequest

> **CreateTenantRequest** = `object`

Defined in: tenants/create-tenant.ts:97

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

1.0.0

## Properties

### billing\_email

> **billing\_email**: `string`

Defined in: tenants/create-tenant.ts:101

Email address for billing notifications

***

### name

> **name**: `string`

Defined in: tenants/create-tenant.ts:99

Name of the tenant organization

***

### user\_id

> **user\_id**: `string`

Defined in: tenants/create-tenant.ts:103

ID of the user who will own the tenant
