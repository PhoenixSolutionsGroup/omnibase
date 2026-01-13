
# Relationship

Keto relationship tuple representing a permission relationship

## Properties

Name | Type
------------ | -------------
`namespace` | string
`object` | string
`relation` | string
`subjectId` | string
`subjectSet` | [SubjectSet](SubjectSet.md)

## Example

```typescript
import type { Relationship } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "namespace": Project,
  "object": project_test_123,
  "relation": member,
  "subjectId": 550e8400-e29b-41d4-a716-446655440000,
  "subjectSet": null,
} satisfies Relationship

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Relationship
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


