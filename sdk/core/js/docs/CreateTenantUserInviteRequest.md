
# CreateTenantUserInviteRequest

Request to invite a user to the tenant

## Properties

Name | Type
------------ | -------------
`email` | string
`role` | string
`inviteUrl` | string

## Example

```typescript
import type { CreateTenantUserInviteRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "email": test@example.com,
  "role": member,
  "inviteUrl": https://test.example.com/accept-invite,
} satisfies CreateTenantUserInviteRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTenantUserInviteRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


