
# ParsedNamespaceDefinition


## Properties

Name | Type
------------ | -------------
`file` | string
`namespace` | string
`permits` | Array&lt;string&gt;
`relations` | Array&lt;string&gt;
`relationsMetadata` | [Array&lt;RelationMetadata&gt;](RelationMetadata.md)
`subjectRelations` | { [key: string]: Array&lt;string&gt; | null; }

## Example

```typescript
import type { ParsedNamespaceDefinition } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "file": null,
  "namespace": null,
  "permits": null,
  "relations": null,
  "relationsMetadata": null,
  "subjectRelations": null,
} satisfies ParsedNamespaceDefinition

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ParsedNamespaceDefinition
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


