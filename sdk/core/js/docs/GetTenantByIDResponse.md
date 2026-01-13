
# GetTenantByIDResponse

Response containing a tenant by ID

## Properties

Name | Type
------------ | -------------
`tenant` | [Tenant](Tenant.md)

## Example

```typescript
import type { GetTenantByIDResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "tenant": null,
} satisfies GetTenantByIDResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetTenantByIDResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


