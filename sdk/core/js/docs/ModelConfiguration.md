
# ModelConfiguration


## Properties

Name | Type
------------ | -------------
`coupons` | [Array&lt;Coupon&gt;](Coupon.md)
`meters` | [Array&lt;Meter&gt;](Meter.md)
`products` | [Array&lt;Product&gt;](Product.md)
`promotionCodes` | [Array&lt;PromotionCode&gt;](PromotionCode.md)
`version` | string
`webhooks` | [Array&lt;WebhookEndpointConfig&gt;](WebhookEndpointConfig.md)

## Example

```typescript
import type { ModelConfiguration } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "coupons": null,
  "meters": null,
  "products": null,
  "promotionCodes": null,
  "version": null,
  "webhooks": null,
} satisfies ModelConfiguration

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ModelConfiguration
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


