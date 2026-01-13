
# Tenant

Main tenant/organization entity

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`stripeCustomerId` | string
`enterpriseTemplate` | string
`enterpriseId` | string
`type` | string
`createdAt` | Date
`updatedAt` | Date
`settings` | [TenantSettings](TenantSettings.md)

## Example

```typescript
import type { Tenant } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  "name": Test Organization,
  "stripeCustomerId": cus_TOWEstcga5ou7a,
  "enterpriseTemplate": tier1_10pct_off,
  "enterpriseId": acme_corp,
  "type": organization,
  "createdAt": 2025-11-10T00:42:29.440300124Z,
  "updatedAt": 2025-11-10T00:42:29.440300172Z,
  "settings": null,
} satisfies Tenant

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Tenant
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


