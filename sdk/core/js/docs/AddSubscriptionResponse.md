
# AddSubscriptionResponse


## Properties

Name | Type
------------ | -------------
`subscriptionId` | string
`status` | string
`message` | string

## Example

```typescript
import type { AddSubscriptionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "subscriptionId": sub_test_123,
  "status": active,
  "message": Subscription added successfully,
} satisfies AddSubscriptionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddSubscriptionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


