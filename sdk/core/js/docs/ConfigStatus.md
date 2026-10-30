
# ConfigStatus


## Properties

Name | Type
------------ | -------------
`drift` | [Array&lt;ConfigStatusEntry&gt;](ConfigStatusEntry.md)
`pending` | [Array&lt;ConfigStatusEntry&gt;](ConfigStatusEntry.md)
`summary` | [ConfigStatusSummary](ConfigStatusSummary.md)
`untracked` | [Array&lt;ConfigStatusEntry&gt;](ConfigStatusEntry.md)

## Example

```typescript
import type { ConfigStatus } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "drift": null,
  "pending": null,
  "summary": null,
  "untracked": null,
} satisfies ConfigStatus

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigStatus
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


