
# SubscriptionResponse


## Properties

Name | Type
------------ | -------------
`cancelAtPeriodEnd` | boolean
`canceledAt` | number
`configPriceId` | string
`currentPeriodEnd` | number
`currentPeriodStart` | number
`isLegacyPrice` | boolean
`status` | string
`subscriptionId` | string
`trialEnd` | number
`trialStart` | number

## Example

```typescript
import type { SubscriptionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "cancelAtPeriodEnd": null,
  "canceledAt": null,
  "configPriceId": null,
  "currentPeriodEnd": null,
  "currentPeriodStart": null,
  "isLegacyPrice": null,
  "status": null,
  "subscriptionId": null,
  "trialEnd": null,
  "trialStart": null,
} satisfies SubscriptionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SubscriptionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


