
# AddLineItemByPriceRequest


## Properties

Name | Type
------------ | -------------
`currency` | string
`description` | string
`metadata` | { [key: string]: string; }
`priceId` | string
`quantity` | number
`stripePriceId` | string

## Example

```typescript
import type { AddLineItemByPriceRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "currency": null,
  "description": null,
  "metadata": null,
  "priceId": null,
  "quantity": null,
  "stripePriceId": null,
} satisfies AddLineItemByPriceRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AddLineItemByPriceRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


