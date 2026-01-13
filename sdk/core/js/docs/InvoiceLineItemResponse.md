
# InvoiceLineItemResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`amount` | number
`description` | string

## Example

```typescript
import type { InvoiceLineItemResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": ii_1234567890,
  "amount": 1000,
  "description": Platform fee,
} satisfies InvoiceLineItemResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceLineItemResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


