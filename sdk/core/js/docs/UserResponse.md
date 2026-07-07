
# UserResponse


## Properties

Name | Type
------------ | -------------
`email` | string
`firstName` | string
`lastName` | string
`role` | string
`userId` | string

## Example

```typescript
import type { UserResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "email": null,
  "firstName": null,
  "lastName": null,
  "role": null,
  "userId": null,
} satisfies UserResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


