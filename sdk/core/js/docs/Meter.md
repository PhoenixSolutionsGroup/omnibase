
# Meter


## Properties

Name | Type
------------ | -------------
`customerMapping` | [MeterCustomerMapping](MeterCustomerMapping.md)
`defaultAggregation` | [MeterDefaultAggregation](MeterDefaultAggregation.md)
`displayName` | string
`eventName` | string
`id` | string
`stripeId` | string
`valueSettings` | [MeterValueSettings](MeterValueSettings.md)

## Example

```typescript
import type { Meter } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "customerMapping": null,
  "defaultAggregation": null,
  "displayName": null,
  "eventName": null,
  "id": null,
  "stripeId": null,
  "valueSettings": null,
} satisfies Meter

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Meter
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


