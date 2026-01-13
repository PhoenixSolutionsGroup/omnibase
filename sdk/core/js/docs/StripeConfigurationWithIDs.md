
# StripeConfigurationWithIDs


## Properties

Name | Type
------------ | -------------
`version` | string
`webhooks` | [Array&lt;WebhookEndpointConfig&gt;](WebhookEndpointConfig.md)
`meters` | [Array&lt;MeterWithStripeID&gt;](MeterWithStripeID.md)
`products` | [Array&lt;ProductWithStripeIDs&gt;](ProductWithStripeIDs.md)
`coupons` | [Array&lt;CouponWithStripeID&gt;](CouponWithStripeID.md)
`promotionCodes` | [Array&lt;PromotionCodeWithStripeID&gt;](PromotionCodeWithStripeID.md)

## Example

```typescript
import type { StripeConfigurationWithIDs } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "version": 1.0.0,
  "webhooks": null,
  "meters": null,
  "products": null,
  "coupons": null,
  "promotionCodes": null,
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


