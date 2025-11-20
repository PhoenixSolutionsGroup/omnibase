
# AssignRoleRequest

Request to assign a role to a user. Must provide EITHER role_id OR role_name, not both.

## Properties

Name | Type
------------ | -------------
`roleId` | string
`roleName` | string

## Example

```typescript
import type { AssignRoleRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "roleId": role_test_123,
  "roleName": member,
} satisfies AssignRoleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AssignRoleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


