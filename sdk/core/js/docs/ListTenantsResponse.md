
# ListTenantsResponse


## Properties

Name | Type
------------ | -------------
`tenants` | [Array&lt;UserTenantListItem&gt;](UserTenantListItem.md)

## Example

```typescript
import type { ListTenantsResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "tenants": null,
} satisfies ListTenantsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ListTenantsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


