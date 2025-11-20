
# RolesListResponse

List of roles in a tenant

## Properties

Name | Type
------------ | -------------
`roles` | [Array&lt;Role&gt;](Role.md)

## Example

```typescript
import type { RolesListResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "roles": null,
} satisfies RolesListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RolesListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


