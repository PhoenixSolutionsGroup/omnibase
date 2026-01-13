
# CreateRoleRequest

Request to create a new role

## Properties

Name | Type
------------ | -------------
`roleName` | string
`permissions` | Array&lt;string&gt;

## Example

```typescript
import type { CreateRoleRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "roleName": test_project_viewer,
  "permissions": [tenant#read, tenant#manage_projects],
} satisfies CreateRoleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRoleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


