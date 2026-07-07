
# Session


## Properties

Name | Type
------------ | -------------
`additionalProperties` | object
`active` | boolean
`authenticatedAt` | Date
`authenticationMethods` | [Array&lt;SessionAuthenticationMethod&gt;](SessionAuthenticationMethod.md)
`authenticatorAssuranceLevel` | string
`devices` | [Array&lt;SessionDevice&gt;](SessionDevice.md)
`expiresAt` | Date
`id` | string
`identity` | [Identity](Identity.md)
`issuedAt` | Date
`tokenized` | string

## Example

```typescript
import type { Session } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "additionalProperties": null,
  "active": null,
  "authenticatedAt": null,
  "authenticationMethods": null,
  "authenticatorAssuranceLevel": null,
  "devices": null,
  "expiresAt": null,
  "id": null,
  "identity": null,
  "issuedAt": null,
  "tokenized": null,
} satisfies Session

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Session
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


