
# MeterWithStripeID


## Properties

Name | Type
------------ | -------------
`id` | string
`displayName` | string
`eventName` | string
`defaultAggregation` | [MeterDefaultAggregation](MeterDefaultAggregation.md)
`customerMapping` | [MeterCustomerMapping](MeterCustomerMapping.md)
`valueSettings` | [MeterValueSettings](MeterValueSettings.md)
`stripeId` | string

## Example

```typescript
import type { MeterWithStripeID } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": api_requests,
  "displayName": API Requests,
  "eventName": api_request,
  "defaultAggregation": null,
  "customerMapping": null,
  "valueSettings": null,
  "stripeId": mtr_1SRiyyCJIZaBlhY1,
} satisfies MeterWithStripeID

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MeterWithStripeID
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


