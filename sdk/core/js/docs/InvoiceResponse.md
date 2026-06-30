
# InvoiceResponse


## Properties

Name | Type
------------ | -------------
`amountDue` | number
`currency` | string
`customerId` | string
`hostedInvoiceUrl` | string
`id` | string
`invoicePdf` | string
`status` | string

## Example

```typescript
import type { InvoiceResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "amountDue": null,
  "currency": null,
  "customerId": null,
  "hostedInvoiceUrl": null,
  "id": null,
  "invoicePdf": null,
  "status": null,
} satisfies InvoiceResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


