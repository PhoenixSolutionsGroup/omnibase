
# StripeConfigResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`config` | [StripeConfigurationWithIDs](StripeConfigurationWithIDs.md)
`version` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { StripeConfigResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": e056fa27-151d-4d25-b237-97e9de8d8dbf,
  "config": null,
  "version": 1.0.0,
  "createdAt": 2025-11-10T00:29:19Z,
  "updatedAt": 2025-11-10T00:29:19Z,
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


