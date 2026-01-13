
# MeterCustomerMapping


## Properties

Name | Type
------------ | -------------
`eventPayloadKey` | string
`type` | string

## Example

```typescript
import type { MeterCustomerMapping } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "eventPayloadKey": customer_id,
  "type": by_id,
} satisfies MeterCustomerMapping

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MeterCustomerMapping
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


