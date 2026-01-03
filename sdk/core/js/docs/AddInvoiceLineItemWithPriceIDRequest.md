
# AddInvoiceLineItemWithPriceIDRequest


## Properties

Name | Type
------------ | -------------
`priceId` | string
`stripePriceId` | string
`quantity` | number
`description` | string
`currency` | [CurrencyCode](CurrencyCode.md)
`metadata` | { [key: string]: string; }

## Example

```typescript
import type { AddInvoiceLineItemWithPriceIDRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "priceId": hetzner_cx23_nbg1_hourly,
  "stripePriceId": price_1ABC123,
  "quantity": 720,
  "description": VPS Compute - 720 hours,
  "currency": null,
  "metadata": null,
} satisfies AddInvoiceLineItemWithPriceIDRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddInvoiceLineItemWithPriceIDRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


