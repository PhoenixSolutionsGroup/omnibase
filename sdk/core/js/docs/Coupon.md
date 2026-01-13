
# Coupon


## Properties

Name | Type
------------ | -------------
`id` | string
`stripeId` | string
`name` | string
`percentOff` | number
`amountOff` | number
`currency` | string
`duration` | [CouponDuration](CouponDuration.md)
`durationInMonths` | number
`maxRedemptions` | number
`redeemBy` | number
`appliesTo` | Array&lt;string&gt;
`metadata` | { [key: string]: string; }

## Example

```typescript
import type { Coupon } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": launch_discount,
  "stripeId": coupon_1SRiyyCJIZaBlhY1,
  "name": Launch Discount,
  "percentOff": 20,
  "amountOff": 500,
  "currency": usd,
  "duration": null,
  "durationInMonths": 3,
  "maxRedemptions": 100,
  "redeemBy": 1735689600,
  "appliesTo": [pro_plan, enterprise_plan],
  "metadata": {campaign=launch_2025},
} satisfies Coupon

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Coupon
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


