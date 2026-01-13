
# KratosIdentityRecoveryAddressesInner


## Properties

Name | Type
------------ | -------------
`id` | string
`value` | string
`via` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { KratosIdentityRecoveryAddressesInner } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 586ff4ca-f7d6-4a99-8f3c-2b46dbcedb4e,
  "value": user@example.com,
  "via": email,
  "createdAt": null,
  "updatedAt": null,
} satisfies KratosIdentityRecoveryAddressesInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KratosIdentityRecoveryAddressesInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


