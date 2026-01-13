
# LogoutResponse


## Properties

Name | Type
------------ | -------------
`logoutUrl` | string
`logoutToken` | string

## Example

```typescript
import type { LogoutResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "logoutUrl": http://auth.test.example.com/self-service/logout?token=tok_test_abc123xyz,
  "logoutToken": tok_test_abc123xyz,
} satisfies LogoutResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LogoutResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


