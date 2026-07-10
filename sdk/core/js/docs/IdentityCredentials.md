
# IdentityCredentials


## Properties

Name | Type
------------ | -------------
`additionalProperties` | object
`config` | object
`createdAt` | Date
`identifiers` | Array&lt;string&gt;
`type` | string
`updatedAt` | Date
`version` | number

## Example

```typescript
import type { IdentityCredentials } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "additionalProperties": null,
  "config": null,
  "createdAt": null,
  "identifiers": null,
  "type": null,
  "updatedAt": null,
  "version": null,
} satisfies IdentityCredentials

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IdentityCredentials
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


