
# MeterChange


## Properties

Name | Type
------------ | -------------
`meterId` | string
`displayName` | string
`action` | string
`stripeId` | string

## Example

```typescript
import type { MeterChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "meterId": api_calls,
  "displayName": API Calls,
  "action": created,
  "stripeId": mtr_123abc,
} satisfies MeterChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MeterChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


