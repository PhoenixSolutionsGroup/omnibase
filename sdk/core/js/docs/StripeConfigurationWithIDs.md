
# StripeConfigurationWithIDs


## Properties

Name | Type
------------ | -------------
`coupons` | [Array&lt;CouponWithStripeID&gt;](CouponWithStripeID.md)
`meters` | [Array&lt;MeterWithStripeID&gt;](MeterWithStripeID.md)
`products` | [Array&lt;ProductWithStripeIDs&gt;](ProductWithStripeIDs.md)
`promotionCodes` | [Array&lt;PromotionCodeWithStripeID&gt;](PromotionCodeWithStripeID.md)
`version` | string

## Example

```typescript
import type { StripeConfigurationWithIDs } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "coupons": null,
  "meters": null,
  "products": null,
  "promotionCodes": null,
  "version": null,
} satisfies StripeConfigurationWithIDs

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeConfigurationWithIDs
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


