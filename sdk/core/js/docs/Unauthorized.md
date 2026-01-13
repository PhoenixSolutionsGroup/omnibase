
# Unauthorized

Unauthorized error response (401)

## Properties

Name | Type
------------ | -------------
`status` | number
`error` | string

## Example

```typescript
import type { Unauthorized } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "status": 401,
  "error": Unauthorized,
} satisfies Unauthorized

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Unauthorized
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


