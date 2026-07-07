
# CreateRoleRow


## Properties

Name | Type
------------ | -------------
`createdAt` | Date
`id` | string
`permissions` | Array&lt;string&gt;
`roleName` | string
`templateId` | string
`tenantId` | string
`updatedAt` | Date
`userIds` | Array&lt;string&gt;

## Example

```typescript
import type { CreateRoleRow } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "createdAt": null,
  "id": null,
  "permissions": null,
  "roleName": null,
  "templateId": null,
  "tenantId": null,
  "updatedAt": null,
  "userIds": null,
} satisfies CreateRoleRow

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRoleRow
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


