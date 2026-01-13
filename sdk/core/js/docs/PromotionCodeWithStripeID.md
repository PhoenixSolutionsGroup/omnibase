
# PromotionCodeWithStripeID


## Properties

Name | Type
------------ | -------------
`id` | string
`code` | string
`coupon` | string
`active` | boolean
`maxRedemptions` | number
`firstTimeTransaction` | boolean
`minimumAmount` | number
`minimumAmountCurrency` | string
`expiresAt` | number
`metadata` | { [key: string]: string; }
`stripeId` | string

## Example

```typescript
import type { PromotionCodeWithStripeID } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": promo_launch25,
  "code": LAUNCH25,
  "coupon": launch_discount,
  "active": true,
  "maxRedemptions": 100,
  "firstTimeTransaction": true,
  "minimumAmount": 5000,
  "minimumAmountCurrency": usd,
  "expiresAt": 1735689600,
  "metadata": null,
  "stripeId": promo_1SRiyyCJIZaBlhY1,
} satisfies PromotionCodeWithStripeID

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PromotionCodeWithStripeID
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


