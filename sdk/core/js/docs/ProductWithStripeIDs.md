
# ProductWithStripeIDs


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`description` | string
`type` | string
`prices` | [Array&lt;PriceWithStripeID&gt;](PriceWithStripeID.md)
`ui` | [ProductUI](ProductUI.md)
`stripeId` | string

## Example

```typescript
import type { ProductWithStripeIDs } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": basic_plan,
  "name": Basic Plan,
  "description": Our basic subscription tier,
  "type": service,
  "prices": null,
  "ui": null,
  "stripeId": prod_1SRiyyCJIZaBlhY1,
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


