
# StripeConfigUpdateRequest


## Properties

Name | Type
------------ | -------------
`version` | string
`meters` | [Array&lt;Meter&gt;](Meter.md)
`products` | [Array&lt;Product&gt;](Product.md)

## Example

```typescript
import type { StripeConfigUpdateRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "version": 1.0.0,
  "meters": null,
  "products": null,
} satisfies StripeConfigUpdateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeConfigUpdateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


