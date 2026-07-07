
# NamespaceDefinitionResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`namespace` | string
`relations` | Array&lt;string&gt;
`subjectRelations` | { [key: string]: Array&lt;string&gt; | null; }
`updatedAt` | Date

## Example

```typescript
import type { NamespaceDefinitionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "namespace": null,
  "relations": null,
  "subjectRelations": null,
  "updatedAt": null,
} satisfies NamespaceDefinitionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NamespaceDefinitionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


