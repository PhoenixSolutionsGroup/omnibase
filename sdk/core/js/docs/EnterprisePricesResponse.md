
# EnterprisePricesResponse


## Properties

Name | Type
------------ | -------------
`count` | number
`prices` | [Array&lt;PriceWithStripeID&gt;](PriceWithStripeID.md)

## Example

```typescript
import type { EnterprisePricesResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "count": null,
  "prices": null,
} satisfies EnterprisePricesResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EnterprisePricesResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


