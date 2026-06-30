
# ProductWithStripeIDs


## Properties

Name | Type
------------ | -------------
`description` | string
`id` | string
`name` | string
`prices` | [Array&lt;PriceWithStripeID&gt;](PriceWithStripeID.md)
`stripeId` | string
`type` | string
`ui` | [ProductUI](ProductUI.md)

## Example

```typescript
import type { ProductWithStripeIDs } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "description": null,
  "id": null,
  "name": null,
  "prices": null,
  "stripeId": null,
  "type": null,
  "ui": null,
} satisfies ProductWithStripeIDs

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductWithStripeIDs
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


