
# BadRequestResponse

Bad Request error response (400)

## Properties

Name | Type
------------ | -------------
`error` | string

## Example

```typescript
import type { BadRequestResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "error": Invalid request parameters,
} satisfies BadRequestResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BadRequestResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


