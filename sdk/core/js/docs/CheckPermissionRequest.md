
# CheckPermissionRequest

Check permission request using a subject set

## Properties

Name | Type
------------ | -------------
`namespace` | string
`object` | string
`relation` | string
`subjectSet` | [SubjectSetRequest](SubjectSetRequest.md)

## Example

```typescript
import type { CheckPermissionRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "namespace": Tenant,
  "object": tenant_test_123,
  "relation": can_invite_user,
  "subjectSet": null,
} satisfies CheckPermissionRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CheckPermissionRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


