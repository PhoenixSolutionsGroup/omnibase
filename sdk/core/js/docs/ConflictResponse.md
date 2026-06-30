
# ConflictResponse

Conflict error response (409)

## Properties

Name | Type
------------ | -------------
`error` | string

## Example

```typescript
import type { ConflictResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "error": Conflict,
} satisfies ConflictResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConflictResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


