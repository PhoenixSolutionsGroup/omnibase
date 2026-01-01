
# NamespaceDefinition

Definition of a permission namespace

## Properties

Name | Type
------------ | -------------
`id` | string
`namespace` | string
`relations` | Array&lt;string&gt;
`subjectRelations` | { [key: string]: Array&lt;string&gt;; }
`updatedAt` | Date

## Example

```typescript
import type { NamespaceDefinition } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": bfab650b-f834-4904-a4e8-41343fea86bc,
  "namespace": Tenant,
  "relations": [can_delete_tenant, can_invite_user, can_update_user_role],
  "subjectRelations": {User=[can_delete_tenant, can_invite_user, can_rotate_keys], ApiKey=[can_rotate_keys, can_view_db_secret_key]},
  "updatedAt": 2025-11-10T00:33:08.720326Z,
} satisfies NamespaceDefinition

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NamespaceDefinition
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


