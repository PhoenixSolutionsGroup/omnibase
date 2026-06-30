
# PromotionCode


## Properties

Name | Type
------------ | -------------
`active` | boolean
`code` | string
`coupon` | string
`expiresAt` | number
`firstTimeTransaction` | boolean
`id` | string
`maxRedemptions` | number
`metadata` | { [key: string]: string; }
`minimumAmount` | number
`minimumAmountCurrency` | string
`stripeId` | string

## Example

```typescript
import type { PromotionCode } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "active": null,
  "code": null,
  "coupon": null,
  "expiresAt": null,
  "firstTimeTransaction": null,
  "id": null,
  "maxRedemptions": null,
  "metadata": null,
  "minimumAmount": null,
  "minimumAmountCurrency": null,
  "stripeId": null,
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


