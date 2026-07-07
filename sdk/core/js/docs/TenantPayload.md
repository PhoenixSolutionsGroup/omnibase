
# TenantPayload


## Properties

Name | Type
------------ | -------------
`createdAt` | Date
`enterpriseId` | string
`enterpriseTemplate` | string
`id` | string
`name` | string
`stripeCustomerId` | string
`type` | string
`updatedAt` | Date

## Example

```typescript
import type { TenantPayload } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "createdAt": null,
  "enterpriseId": null,
  "enterpriseTemplate": null,
  "id": null,
  "name": null,
  "stripeCustomerId": null,
  "type": null,
  "updatedAt": null,
} satisfies TenantPayload

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TenantPayload
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


