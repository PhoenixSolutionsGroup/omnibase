
# CreateCheckoutRequest


## Properties

Name | Type
------------ | -------------
`priceId` | string
`successUrl` | string
`cancelUrl` | string
`trialPeriodDays` | number
`promotionCode` | string
`allowPromotionCodes` | boolean

## Example

```typescript
import type { CreateCheckoutRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "priceId": price_test_basic,
  "successUrl": https://test.example.com/success,
  "cancelUrl": https://test.example.com/cancel,
  "trialPeriodDays": 14,
  "promotionCode": SUMMER2024,
  "allowPromotionCodes": true,
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


