
# Identity


## Properties

Name | Type
------------ | -------------
`additionalProperties` | object
`createdAt` | Date
`credentials` | [{ [key: string]: IdentityCredentials; }](IdentityCredentials.md)
`id` | string
`metadataAdmin` | any
`metadataPublic` | any
`organizationId` | object
`recoveryAddresses` | [Array&lt;RecoveryIdentityAddress&gt;](RecoveryIdentityAddress.md)
`schemaId` | string
`schemaUrl` | string
`state` | string
`stateChangedAt` | Date
`traits` | any
`updatedAt` | Date
`verifiableAddresses` | [Array&lt;VerifiableIdentityAddress&gt;](VerifiableIdentityAddress.md)

## Example

```typescript
import type { Identity } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "additionalProperties": null,
  "createdAt": null,
  "credentials": null,
  "id": null,
  "metadataAdmin": null,
  "metadataPublic": null,
  "organizationId": null,
  "recoveryAddresses": null,
  "schemaId": null,
  "schemaUrl": null,
  "state": null,
  "stateChangedAt": null,
  "traits": null,
  "updatedAt": null,
  "verifiableAddresses": null,
} satisfies Identity

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Identity
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


