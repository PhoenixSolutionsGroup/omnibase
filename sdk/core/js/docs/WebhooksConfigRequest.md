
# WebhooksConfigRequest


## Properties

Name | Type
------------ | -------------
`webhooks` | [Array&lt;WebhookEndpointConfig&gt;](WebhookEndpointConfig.md)

## Example

```typescript
import type { WebhooksConfigRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "webhooks": null,
} satisfies WebhooksConfigRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhooksConfigRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


