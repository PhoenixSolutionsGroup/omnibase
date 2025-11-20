
# StripeIDConversionResponse


## Properties

Name | Type
------------ | -------------
`stripeId` | string
`configId` | string
`itemType` | string
`configUuid` | string
`historyCount` | number

## Example

```typescript
import type { StripeIDConversionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "stripeId": price_1SRiyyCJIZaBlhY1NpAJFhNU,
  "configId": price_test_basic_monthly,
  "itemType": price,
  "configUuid": e056fa27-151d-4d25-b237-97e9de8d8dbf,
  "historyCount": 1,
} satisfies StripeIDConversionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeIDConversionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


