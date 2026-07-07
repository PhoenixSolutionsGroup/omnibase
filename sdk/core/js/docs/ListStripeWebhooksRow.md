
# ListStripeWebhooksRow


## Properties

Name | Type
------------ | -------------
`configId` | string
`connect` | boolean
`createdAt` | Date
`events` | Array&lt;string&gt;
`id` | string
`secret` | string
`stripeId` | string
`updatedAt` | Date
`url` | string

## Example

```typescript
import type { ListStripeWebhooksRow } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "configId": null,
  "connect": null,
  "createdAt": null,
  "events": null,
  "id": null,
  "secret": null,
  "stripeId": null,
  "updatedAt": null,
  "url": null,
} satisfies ListStripeWebhooksRow

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ListStripeWebhooksRow
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


