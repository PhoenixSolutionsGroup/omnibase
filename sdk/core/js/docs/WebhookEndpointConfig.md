
# WebhookEndpointConfig


## Properties

Name | Type
------------ | -------------
`id` | string
`url` | string
`events` | Array&lt;string&gt;
`connect` | boolean

## Example

```typescript
import type { WebhookEndpointConfig } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": account_events,
  "url": https://example.com/webhooks/stripe,
  "events": [invoice.paid, customer.subscription.created],
  "connect": false,
} satisfies WebhookEndpointConfig

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhookEndpointConfig
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


