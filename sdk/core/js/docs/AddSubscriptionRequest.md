
# AddSubscriptionRequest

Request to add a subscription to the tenant

## Properties

Name | Type
------------ | -------------
`planId` | string
`stripeCustomerId` | string

## Example

```typescript
import type { AddSubscriptionRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "planId": price_test_basic,
  "stripeCustomerId": cus_test_123,
} satisfies AddSubscriptionRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddSubscriptionRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


