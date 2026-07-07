
# AddRequest


## Properties

Name | Type
------------ | -------------
`planId` | string
`quantity` | number
`stripeCustomerId` | string

## Example

```typescript
import type { AddRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "planId": null,
  "quantity": null,
  "stripeCustomerId": null,
} satisfies AddRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


