
# SubscriptionResponse

Stripe subscription information

## Properties

Name | Type
------------ | -------------
`subscriptionId` | string
`configPriceId` | string
`status` | string
`currentPeriodStart` | number
`currentPeriodEnd` | number
`cancelAtPeriodEnd` | boolean
`canceledAt` | number
`trialStart` | number
`trialEnd` | number
`isLegacyPrice` | boolean

## Example

```typescript
import type { SubscriptionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "subscriptionId": sub_1234567890,
  "configPriceId": neon_compute_starter,
  "status": active,
  "currentPeriodStart": 1705320600,
  "currentPeriodEnd": 1707999000,
  "cancelAtPeriodEnd": false,
  "canceledAt": null,
  "trialStart": null,
  "trialEnd": null,
  "isLegacyPrice": false,
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


