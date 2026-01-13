
# AcceptInviteResponse

Response after accepting an invite

## Properties

Name | Type
------------ | -------------
`tenantId` | string
`token` | string
`message` | string

## Example

```typescript
import type { AcceptInviteResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "tenantId": tenant_test_123,
  "token": eyJhbGciOiJIUzI1NiIs...,
  "message": Successfully joined organization,
} satisfies AcceptInviteResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AcceptInviteResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


