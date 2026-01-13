
# SubjectSet

Subject set representation in Keto relationship tuples

## Properties

Name | Type
------------ | -------------
`namespace` | string
`object` | string
`relation` | string

## Example

```typescript
import type { SubjectSet } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "namespace": Tenant,
  "object": tenant_test_123,
  "relation": member,
} satisfies SubjectSet

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SubjectSet
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


