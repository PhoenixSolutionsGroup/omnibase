
# Coupon


## Properties

Name | Type
------------ | -------------
`amountOff` | number
`appliesTo` | Array&lt;string&gt;
`currency` | string
`duration` | string
`durationInMonths` | number
`id` | string
`maxRedemptions` | number
`metadata` | { [key: string]: string; }
`name` | string
`percentOff` | number
`redeemBy` | number
`stripeId` | string

## Example

```typescript
import type { Coupon } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "amountOff": null,
  "appliesTo": null,
  "currency": null,
  "duration": null,
  "durationInMonths": null,
  "id": null,
  "maxRedemptions": null,
  "metadata": null,
  "name": null,
  "percentOff": null,
  "redeemBy": null,
  "stripeId": null,
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


