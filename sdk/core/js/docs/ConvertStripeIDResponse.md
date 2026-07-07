
# ConvertStripeIDResponse


## Properties

Name | Type
------------ | -------------
`configId` | string
`configUuid` | string
`historyCount` | number
`itemType` | string
`stripeId` | string

## Example

```typescript
import type { ConvertStripeIDResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "configId": null,
  "configUuid": null,
  "historyCount": null,
  "itemType": null,
  "stripeId": null,
} satisfies ConvertStripeIDResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConvertStripeIDResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


