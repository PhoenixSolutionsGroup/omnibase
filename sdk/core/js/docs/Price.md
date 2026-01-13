
# Price


## Properties

Name | Type
------------ | -------------
`id` | string
`stripeId` | string
`_public` | boolean
`taxIncludedInPrice` | boolean
`amount` | number
`currency` | [CurrencyCode](CurrencyCode.md)
`interval` | [BillingInterval](BillingInterval.md)
`intervalCount` | number
`usageType` | [UsageType](UsageType.md)
`meter` | string
`billingScheme` | [TieredBillingScheme](TieredBillingScheme.md)
`_default` | boolean
`enterpriseTemplate` | string
`enterpriseId` | string
`ui` | [PriceUI](PriceUI.md)
`tiersMode` | [TiersMode](TiersMode.md)
`tiers` | [Array&lt;Tier&gt;](Tier.md)

## Example

```typescript
import type { Price } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": basic_monthly_tiered,
  "stripeId": price_1SRiyyCJIZaBlhY1NpAJFhNU,
  "_public": true,
  "taxIncludedInPrice": false,
  "amount": 0.273,
  "currency": null,
  "interval": null,
  "intervalCount": 1,
  "usageType": null,
  "meter": api_requests,
  "billingScheme": null,
  "_default": false,
  "enterpriseTemplate": tier1_10pct_off,
  "enterpriseId": acme_corp,
  "ui": null,
  "tiersMode": null,
  "tiers": null,
} satisfies Price

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Price
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


