
# ProductResponse


## Properties

Name | Type
------------ | -------------
`product` | [ProductWithStripeIDs](ProductWithStripeIDs.md)

## Example

```typescript
import type { ProductResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "product": null,
} satisfies ProductResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


