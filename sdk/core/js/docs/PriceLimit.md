
# PriceLimit


## Properties

Name | Type
------------ | -------------
`text` | string
`value` | number
`unit` | string

## Example

```typescript
import type { PriceLimit } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "text": Up to 1000 API calls,
  "value": 1000,
  "unit": requests,
} satisfies PriceLimit

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PriceLimit
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


