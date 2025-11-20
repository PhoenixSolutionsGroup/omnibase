
# KratosIdentityCredentialsPassword


## Properties

Name | Type
------------ | -------------
`type` | string
`identifiers` | Array&lt;string&gt;
`version` | number
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { KratosIdentityCredentialsPassword } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "type": password,
  "identifiers": [user@example.com],
  "version": 0,
  "createdAt": null,
  "updatedAt": null,
} satisfies KratosIdentityCredentialsPassword

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentityCredentialsPassword
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


