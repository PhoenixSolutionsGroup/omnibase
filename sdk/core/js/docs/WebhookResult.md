
# WebhookResult


## Properties

Name | Type
------------ | -------------
`id` | string
`stripeId` | string
`url` | string
`events` | Array&lt;string&gt;
`connect` | boolean
`secret` | string
`action` | string

## Example

```typescript
import type { WebhookResult } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": e056fa27-151d-4d25-b237-97e9de8d8dbf,
  "stripeId": we_1SRiyyCJIZaBlhY1,
  "url": https://example.com/webhooks/stripe,
  "events": [invoice.paid],
  "connect": false,
  "secret": whsec_xxx,
  "action": created,
} satisfies WebhookResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhookResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


