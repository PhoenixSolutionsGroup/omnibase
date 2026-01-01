
# DeleteRelationshipRequestWithSubjectId

Delete relationship request using a direct subject identifier

## Properties

Name | Type
------------ | -------------
`namespace` | string
`object` | string
`relation` | string
`subjectId` | string

## Example

```typescript
import type { DeleteRelationshipRequestWithSubjectId } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "namespace": null,
  "object": null,
  "relation": null,
  "subjectId": null,
} satisfies DeleteRelationshipRequestWithSubjectId

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeleteRelationshipRequestWithSubjectId
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


