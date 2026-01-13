
# AddInvoiceLineItemRequest


## Properties

Name | Type
------------ | -------------
`amount` | number
`description` | string
`currency` | [CurrencyCode](CurrencyCode.md)

## Example

```typescript
import type { AddInvoiceLineItemRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "amount": 1000,
  "description": Platform fee,
  "currency": null,
} satisfies AddInvoiceLineItemRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddInvoiceLineItemRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


