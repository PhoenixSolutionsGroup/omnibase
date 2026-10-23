
# UpsertSystemTemplateRequest


## Properties

Name | Type
------------ | -------------
`htmlBody` | string
`name` | string
`plaintextBody` | string
`subject` | string

## Example

```typescript
import type { UpsertSystemTemplateRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "htmlBody": null,
  "name": null,
  "plaintextBody": null,
  "subject": null,
} satisfies UpsertSystemTemplateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpsertSystemTemplateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


