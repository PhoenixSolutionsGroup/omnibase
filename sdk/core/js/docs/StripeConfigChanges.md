
# StripeConfigChanges

Summary of changes made during configuration update

## Properties

Name | Type
------------ | -------------
`products` | [ProductChanges](ProductChanges.md)
`prices` | [PriceChanges](PriceChanges.md)
`meters` | [MeterChanges](MeterChanges.md)
`webhooks` | [WebhookChanges](WebhookChanges.md)
`coupons` | [CouponChanges](CouponChanges.md)
`promotionCodes` | [PromotionCodeChanges](PromotionCodeChanges.md)

## Example

```typescript
import type { StripeConfigChanges } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "products": null,
  "prices": null,
  "meters": null,
  "webhooks": null,
  "coupons": null,
  "promotionCodes": null,
} satisfies StripeConfigChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeConfigChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


