
# VerifiableIdentityAddress


## Properties

Name | Type
------------ | -------------
`additionalProperties` | object
`createdAt` | Date
`id` | string
`status` | string
`updatedAt` | Date
`value` | string
`verified` | boolean
`verifiedAt` | Date
`via` | string

## Example

```typescript
import type { VerifiableIdentityAddress } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "additionalProperties": null,
  "createdAt": null,
  "id": null,
  "status": null,
  "updatedAt": null,
  "value": null,
  "verified": null,
  "verifiedAt": null,
  "via": null,
} satisfies VerifiableIdentityAddress

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VerifiableIdentityAddress
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


