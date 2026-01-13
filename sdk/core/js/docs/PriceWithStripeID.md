
# PriceWithStripeID


## Properties

Name | Type
------------ | -------------
`id` | string
`_public` | boolean
`taxIncludedInPrice` | boolean
`amount` | number
`currency` | [CurrencyCode](CurrencyCode.md)
`interval` | [BillingInterval](BillingInterval.md)
`intervalCount` | number
`usageType` | [UsageType](UsageType.md)
`meter` | string
`billingScheme` | string
`tiersMode` | string
`tiers` | [Array&lt;Tier&gt;](Tier.md)
`_default` | boolean
`enterpriseTemplate` | string
`enterpriseId` | string
`ui` | [PriceUI](PriceUI.md)
`stripeId` | string

## Example

```typescript
import type { PriceWithStripeID } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": basic_monthly,
  "_public": true,
  "taxIncludedInPrice": false,
  "amount": 0.273,
  "currency": null,
  "interval": null,
  "intervalCount": 1,
  "usageType": null,
  "meter": api_requests,
  "billingScheme": per_unit,
  "tiersMode": graduated,
  "tiers": null,
  "_default": false,
  "enterpriseTemplate": tier1_10pct_off,
  "enterpriseId": acme_corp,
  "ui": null,
  "stripeId": price_1SRiyyCJIZaBlhY1NpAJFhNU,
} satisfies PriceWithStripeID

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PriceWithStripeID
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


