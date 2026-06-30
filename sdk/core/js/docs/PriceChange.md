
# PriceChange


## Properties

Name | Type
------------ | -------------
`action` | string
`priceId` | string
`productId` | string
`stripeId` | string

## Example

```typescript
import type { PriceChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "action": null,
  "priceId": null,
  "productId": null,
  "stripeId": null,
} satisfies PriceChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PriceChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


