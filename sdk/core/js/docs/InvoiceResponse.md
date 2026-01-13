
# InvoiceResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`status` | string
`amountDue` | number
`currency` | string
`customerId` | string
`invoicePdf` | string
`hostedInvoiceUrl` | string

## Example

```typescript
import type { InvoiceResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": in_1234567890,
  "status": draft,
  "amountDue": 2000,
  "currency": usd,
  "customerId": cus_1234567890,
  "invoicePdf": https://pay.stripe.com/invoice/...,
  "hostedInvoiceUrl": https://invoice.stripe.com/i/...,
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


