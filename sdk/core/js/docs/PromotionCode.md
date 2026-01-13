
# PromotionCode


## Properties

Name | Type
------------ | -------------
`id` | string
`stripeId` | string
`code` | string
`coupon` | string
`active` | boolean
`maxRedemptions` | number
`firstTimeTransaction` | boolean
`minimumAmount` | number
`minimumAmountCurrency` | string
`expiresAt` | number
`metadata` | { [key: string]: string; }

## Example

```typescript
import type { PromotionCode } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": promo_launch25,
  "stripeId": promo_1SRiyyCJIZaBlhY1,
  "code": LAUNCH25,
  "coupon": launch_discount,
  "active": true,
  "maxRedemptions": 100,
  "firstTimeTransaction": true,
  "minimumAmount": 5000,
  "minimumAmountCurrency": usd,
  "expiresAt": 1735689600,
  "metadata": null,
} satisfies PromotionCode

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PromotionCode
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


