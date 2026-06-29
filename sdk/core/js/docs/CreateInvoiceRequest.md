
# CreateInvoiceRequest


## Properties

Name | Type
------------ | -------------
`currency` | [CurrencyCode](CurrencyCode.md)
`autoAdvance` | boolean
`collectionMethod` | string
`daysUntilDue` | number
`description` | string
`metadata` | { [key: string]: string; }

## Example

```typescript
import type { CreateInvoiceRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "currency": null,
  "autoAdvance": false,
  "collectionMethod": send_invoice,
  "daysUntilDue": 7,
  "description": Monthly platform fees,
  "metadata": null,
} satisfies CreateInvoiceRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateInvoiceRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


