
# StripeConfigResponse


## Properties

Name | Type
------------ | -------------
`config` | [StripeConfigurationWithIDs](StripeConfigurationWithIDs.md)
`createdAt` | string
`id` | string
`updatedAt` | string
`version` | string

## Example

```typescript
import type { StripeConfigResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "config": null,
  "createdAt": null,
  "id": null,
  "updatedAt": null,
  "version": null,
} satisfies StripeConfigResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeConfigResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


