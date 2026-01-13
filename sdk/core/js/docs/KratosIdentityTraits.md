
# KratosIdentityTraits

Identity traits (email, name, etc.)

## Properties

Name | Type
------------ | -------------
`email` | string
`name` | [KratosIdentityTraitsName](KratosIdentityTraitsName.md)

## Example

```typescript
import type { KratosIdentityTraits } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "email": user@example.com,
  "name": null,
} satisfies KratosIdentityTraits

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentityTraits
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


