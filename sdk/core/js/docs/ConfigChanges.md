
# ConfigChanges


## Properties

Name | Type
------------ | -------------
`coupons` | [CouponChanges](CouponChanges.md)
`meters` | [MeterChanges](MeterChanges.md)
`prices` | [PriceChanges](PriceChanges.md)
`products` | [ProductChanges](ProductChanges.md)
`promotionCodes` | [PromotionCodeChanges](PromotionCodeChanges.md)
`webhooks` | [WebhookChanges](WebhookChanges.md)

## Example

```typescript
import type { ConfigChanges } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "coupons": null,
  "meters": null,
  "prices": null,
  "products": null,
  "promotionCodes": null,
  "webhooks": null,
} satisfies ConfigChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


