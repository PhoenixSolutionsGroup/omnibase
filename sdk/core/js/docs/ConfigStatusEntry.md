
# ConfigStatusEntry


## Properties

Name | Type
------------ | -------------
`id` | string
`kind` | string
`name` | string
`reason` | string
`state` | string
`stripeId` | string

## Example

```typescript
import type { ConfigStatusEntry } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "kind": null,
  "name": null,
  "reason": null,
  "state": null,
  "stripeId": null,
} satisfies ConfigStatusEntry

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigStatusEntry
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


