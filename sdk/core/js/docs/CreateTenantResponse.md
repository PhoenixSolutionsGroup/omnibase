
# CreateTenantResponse

Response after creating a tenant

## Properties

Name | Type
------------ | -------------
`message` | string
`tenant` | [Tenant](Tenant.md)
`token` | string

## Example

```typescript
import type { CreateTenantResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": Tenant created successfully,
  "tenant": null,
  "token": eyJhbGciOiJIUzI1NiIs...,
} satisfies CreateTenantResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTenantResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


