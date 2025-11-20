
# TenantInvite

Tenant user invitation

## Properties

Name | Type
------------ | -------------
`id` | string
`tenantId` | string
`email` | string
`role` | string
`token` | string
`inviterId` | string
`expiresAt` | Date
`usedAt` | Date
`createdAt` | Date
`tenant` | [Tenant](Tenant.md)

## Example

```typescript
import type { TenantInvite } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 550e8400-e29b-41d4-a716-446655440001,
  "tenantId": 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  "email": test@example.com,
  "role": member,
  "token": tok_test_abc123xyz,
  "inviterId": 550e8400-e29b-41d4-a716-446655440000,
  "expiresAt": 2025-11-17T00:42:29.440300124Z,
  "usedAt": null,
  "createdAt": 2025-11-10T00:42:29.440300124Z,
  "tenant": null,
} satisfies TenantInvite

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TenantInvite
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


