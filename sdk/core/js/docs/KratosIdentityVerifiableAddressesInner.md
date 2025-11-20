
# KratosIdentityVerifiableAddressesInner


## Properties

Name | Type
------------ | -------------
`id` | string
`value` | string
`verified` | boolean
`via` | string
`status` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { KratosIdentityVerifiableAddressesInner } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": a25b4bd7-3629-4aa5-bec5-212dc13b2395,
  "value": user@example.com,
  "verified": false,
  "via": email,
  "status": pending,
  "createdAt": null,
  "updatedAt": null,
} satisfies KratosIdentityVerifiableAddressesInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentityVerifiableAddressesInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


