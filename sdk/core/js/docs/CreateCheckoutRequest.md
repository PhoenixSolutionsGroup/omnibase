
# CreateCheckoutRequest


## Properties

Name | Type
------------ | -------------
`allowPromotionCodes` | boolean
`cancelUrl` | string
`priceId` | string
`promotionCode` | string
`successUrl` | string
`trialPeriodDays` | number

## Example

```typescript
import type { CreateCheckoutRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "allowPromotionCodes": null,
  "cancelUrl": null,
  "priceId": null,
  "promotionCode": null,
  "successUrl": null,
  "trialPeriodDays": null,
} satisfies CreateCheckoutRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateCheckoutRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


