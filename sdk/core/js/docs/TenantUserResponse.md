
# TenantUserResponse

Information about a user in the tenant

## Properties

Name | Type
------------ | -------------
`userId` | string
`firstName` | string
`lastName` | string
`email` | string
`role` | string

## Example

```typescript
import type { TenantUserResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "userId": 550e8400-e29b-41d4-a716-446655440000,
  "firstName": John,
  "lastName": Doe,
  "email": test@example.com,
  "role": member,
} satisfies TenantUserResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TenantUserResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


