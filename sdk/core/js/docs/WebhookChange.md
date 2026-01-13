
# WebhookChange


## Properties

Name | Type
------------ | -------------
`webhookId` | string
`url` | string
`action` | string
`stripeId` | string

## Example

```typescript
import type { WebhookChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "webhookId": 550e8400-e29b-41d4-a716-446655440000,
  "url": https://example.com/webhooks/stripe,
  "action": created,
  "stripeId": we_123abc,
} satisfies WebhookChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhookChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


