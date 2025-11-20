
# SchemasConflictResponse

409 Conflict response when resource already exists

## Properties

Name | Type
------------ | -------------
`status` | number
`error` | string

## Example

```typescript
import type { SchemasConflictResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "status": 409,
  "error": Role with this name already exists for tenant,
} satisfies SchemasConflictResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SchemasConflictResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


