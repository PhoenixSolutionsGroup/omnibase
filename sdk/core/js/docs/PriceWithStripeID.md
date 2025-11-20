
# PriceWithStripeID


## Properties

Name | Type
------------ | -------------
`id` | string
`_public` | boolean
`taxIncludedInPrice` | boolean
`amount` | number
`currency` | string
`interval` | string
`intervalCount` | number
`usageType` | string
`meter` | string
`billingScheme` | string
`tiersMode` | string
`tiers` | [Array&lt;Tier&gt;](Tier.md)
`_default` | boolean
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
  "amount": 1999,
  "currency": usd,
  "interval": month,
  "intervalCount": 1,
  "usageType": licensed,
  "meter": api_requests,
  "billingScheme": per_unit,
  "tiersMode": graduated,
  "tiers": null,
  "_default": false,
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


