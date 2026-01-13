
# CreateCheckoutResponse


## Properties

Name | Type
------------ | -------------
`url` | string
`sessionId` | string

## Example

```typescript
import type { CreateCheckoutResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "url": https://checkout.stripe.com/pay/cs_test_...,
  "sessionId": cs_test_a1b2c3d4e5f6,
} satisfies CreateCheckoutResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateCheckoutResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


