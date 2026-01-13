
# InternalServerError

Internal Server Error response (500)

## Properties

Name | Type
------------ | -------------
`status` | number
`error` | string

## Example

```typescript
import type { InternalServerError } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "status": 500,
  "error": Internal Server Error,
} satisfies InternalServerError

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InternalServerError
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


