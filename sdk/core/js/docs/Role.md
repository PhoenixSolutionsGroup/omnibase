
# Role

Role definition with permissions

## Properties

Name | Type
------------ | -------------
`id` | string
`tenantId` | string
`roleName` | string
`permissions` | Array&lt;string&gt;
`templateId` | string
`userIds` | Array&lt;string&gt;
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Role } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 7bde7bd1-9be9-42f5-bc4b-be9f24cde432,
  "tenantId": null,
  "roleName": member,
  "permissions": [tenant#invite_user, tenant#remove_user],
  "templateId": null,
  "userIds": [550e8400-e29b-41d4-a716-446655440000, 550e8400-e29b-41d4-a716-446655440001],
  "createdAt": 2025-11-10T00:18:19.653645Z,
  "updatedAt": 2025-11-10T00:33:08.726632Z,
} satisfies Role

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Role
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


