
# UpdateRoleRequest

Request to update an existing role

## Properties

Name | Type
------------ | -------------
`permissions` | Array&lt;string&gt;

## Example

```typescript
import type { UpdateRoleRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "permissions": [project:*#view, project:*#edit],
} satisfies UpdateRoleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateRoleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


