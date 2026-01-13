
# KratosIdentity


## Properties

Name | Type
------------ | -------------
`id` | string
`schemaId` | string
`schemaUrl` | string
`state` | string
`stateChangedAt` | Date
`traits` | [KratosIdentityTraits](KratosIdentityTraits.md)
`credentials` | [KratosIdentityCredentials](KratosIdentityCredentials.md)
`verifiableAddresses` | [Array&lt;KratosIdentityVerifiableAddressesInner&gt;](KratosIdentityVerifiableAddressesInner.md)
`recoveryAddresses` | [Array&lt;KratosIdentityRecoveryAddressesInner&gt;](KratosIdentityRecoveryAddressesInner.md)
`organizationId` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { KratosIdentity } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 319fc51a-9684-4f4f-87ea-6feefcfcc334,
  "schemaId": default,
  "schemaUrl": http://127.0.0.1:4433/schemas/ZGVmYXVsdA,
  "state": active,
  "stateChangedAt": 2025-11-12T09:18:51.828257251Z,
  "traits": null,
  "credentials": null,
  "verifiableAddresses": null,
  "recoveryAddresses": null,
  "organizationId": null,
  "createdAt": 2025-11-12T09:18:51.829324Z,
  "updatedAt": 2025-11-12T09:18:51.829324Z,
} satisfies KratosIdentity

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentity
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


