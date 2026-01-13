
# WebhookChanges

Summary of webhook changes made during configuration update

## Properties

Name | Type
------------ | -------------
`created` | [Array&lt;WebhookChange&gt;](WebhookChange.md)
`updated` | [Array&lt;WebhookChange&gt;](WebhookChange.md)
`unchanged` | [Array&lt;WebhookChange&gt;](WebhookChange.md)

## Example

```typescript
import type { WebhookChanges } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "created": null,
  "updated": null,
  "unchanged": null,
} satisfies WebhookChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhookChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


