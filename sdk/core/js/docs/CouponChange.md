
# CouponChange


## Properties

Name | Type
------------ | -------------
`action` | string
`couponId` | string
`name` | string
`stripeId` | string

## Example

```typescript
import type { CouponChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "action": null,
  "couponId": null,
  "name": null,
  "stripeId": null,
} satisfies CouponChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CouponChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


