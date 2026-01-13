
# CouponDuration

Duration for the coupon discount. - once: Discount applies to the first charge only - repeating: Discount applies for a specified number of months (requires duration_in_months) - forever: Discount applies indefinitely (only valid with percent_off, not amount_off) 

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { CouponDuration } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
} satisfies CouponDuration

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CouponDuration
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


