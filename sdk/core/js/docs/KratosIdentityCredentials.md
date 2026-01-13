
# KratosIdentityCredentials

Authentication credentials information

## Properties

Name | Type
------------ | -------------
`password` | [KratosIdentityCredentialsPassword](KratosIdentityCredentialsPassword.md)

## Example

```typescript
import type { KratosIdentityCredentials } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "password": null,
} satisfies KratosIdentityCredentials

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentityCredentials
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


