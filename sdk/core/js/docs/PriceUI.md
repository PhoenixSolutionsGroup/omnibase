
# PriceUI


## Properties

Name | Type
------------ | -------------
`displayName` | string
`priceDisplay` | [PriceDisplay](PriceDisplay.md)
`billingPeriod` | string
`features` | Array&lt;string&gt;
`limits` | [Array&lt;PriceLimit&gt;](PriceLimit.md)

## Example

```typescript
import type { PriceUI } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "displayName": Monthly,
  "priceDisplay": null,
  "billingPeriod": per month,
  "features": [Billed monthly],
  "limits": null,
} satisfies PriceUI

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PriceUI
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


