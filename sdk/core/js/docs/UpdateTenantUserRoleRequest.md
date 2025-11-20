
# UpdateTenantUserRoleRequest

Request to update a user\'s role

## Properties

Name | Type
------------ | -------------
`role` | string
`userId` | string

## Example

```typescript
import type { UpdateTenantUserRoleRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "role": member,
  "userId": 550e8400-e29b-41d4-a716-446655440001,
} satisfies UpdateTenantUserRoleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateTenantUserRoleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


