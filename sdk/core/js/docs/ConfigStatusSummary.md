
# ConfigStatusSummary


## Properties

Name | Type
------------ | -------------
`drift` | number
`pending` | number
`untracked` | number

## Example

```typescript
import type { ConfigStatusSummary } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "drift": null,
  "pending": null,
  "untracked": null,
} satisfies ConfigStatusSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigStatusSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


