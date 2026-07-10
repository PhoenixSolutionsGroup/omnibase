
# CreateRequest


## Properties

Name | Type
------------ | -------------
`email` | string
`inviteUrl` | string
`role` | string

## Example

```typescript
import type { CreateRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "email": null,
  "inviteUrl": null,
  "role": null,
} satisfies CreateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


