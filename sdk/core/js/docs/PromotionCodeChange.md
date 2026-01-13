
# PromotionCodeChange


## Properties

Name | Type
------------ | -------------
`promoId` | string
`code` | string
`action` | string
`stripeId` | string

## Example

```typescript
import type { PromotionCodeChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "promoId": promo_launch25,
  "code": LAUNCH25,
  "action": created,
  "stripeId": promo_123abc,
} satisfies PromotionCodeChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PromotionCodeChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


