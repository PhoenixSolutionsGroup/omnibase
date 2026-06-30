
# CalculatePriceCostResponse


## Properties

Name | Type
------------ | -------------
`billingScheme` | string
`costCents` | number
`currency` | string
`effectiveUnitCostCents` | number
`priceId` | string
`quantity` | number
`tiersMode` | string

## Example

```typescript
import type { CalculatePriceCostResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "billingScheme": null,
  "costCents": null,
  "currency": null,
  "effectiveUnitCostCents": null,
  "priceId": null,
  "quantity": null,
  "tiersMode": null,
} satisfies CalculatePriceCostResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CalculatePriceCostResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


