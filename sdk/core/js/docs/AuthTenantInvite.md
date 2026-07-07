
# AuthTenantInvite


## Properties

Name | Type
------------ | -------------
`createdAt` | Date
`email` | string
`expiresAt` | Date
`id` | string
`inviterId` | string
`role` | string
`tenantId` | string
`token` | string
`usedAt` | Date

## Example

```typescript
import type { AuthTenantInvite } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "createdAt": null,
  "email": null,
  "expiresAt": null,
  "id": null,
  "inviterId": null,
  "role": null,
  "tenantId": null,
  "token": null,
  "usedAt": null,
} satisfies AuthTenantInvite

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AuthTenantInvite
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


