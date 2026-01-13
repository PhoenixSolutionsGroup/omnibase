
# ProductChange


## Properties

Name | Type
------------ | -------------
`productId` | string
`productName` | string
`action` | string
`stripeId` | string
`details` | Array&lt;string&gt;

## Example

```typescript
import type { ProductChange } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "productId": basic_plan,
  "productName": Basic Plan,
  "action": created,
  "stripeId": prod_123abc,
  "details": [Price test_price created, Price old_price archived],
} satisfies ProductChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


