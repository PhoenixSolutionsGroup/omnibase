
# PriceWithStripeID


## Properties

Name | Type
------------ | -------------
`amount` | number
`billingScheme` | string
`currency` | string
`_default` | boolean
`enterpriseId` | string
`enterpriseTemplate` | string
`id` | string
`interval` | string
`intervalCount` | number
`meter` | string
`_public` | boolean
`stripeId` | string
`taxIncludedInPrice` | boolean
`tiers` | [Array&lt;Tier&gt;](Tier.md)
`tiersMode` | string
`ui` | [PriceUI](PriceUI.md)
`usageType` | string

## Example

```typescript
import type { PriceWithStripeID } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "amount": null,
  "billingScheme": null,
  "currency": null,
  "_default": null,
  "enterpriseId": null,
  "enterpriseTemplate": null,
  "id": null,
  "interval": null,
  "intervalCount": null,
  "meter": null,
  "_public": null,
  "stripeId": null,
  "taxIncludedInPrice": null,
  "tiers": null,
  "tiersMode": null,
  "ui": null,
  "usageType": null,
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


