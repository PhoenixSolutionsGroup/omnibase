
# CalculatePriceCostResponse


## Properties

Name | Type
------------ | -------------
`priceId` | string
`quantity` | number
`costCents` | number
`effectiveUnitCostCents` | number
`currency` | string
`billingScheme` | string
`tiersMode` | string

## Example

```typescript
import type { CalculatePriceCostResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "priceId": compute_hourly,
  "quantity": 1500,
  "costCents": 15000,
  "effectiveUnitCostCents": 10,
  "currency": usd,
  "billingScheme": per_unit,
  "tiersMode": graduated,
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


