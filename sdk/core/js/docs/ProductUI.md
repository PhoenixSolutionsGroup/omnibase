
# ProductUI


## Properties

Name | Type
------------ | -------------
`displayName` | string
`tagline` | string
`features` | Array&lt;string&gt;
`badge` | string
`ctaText` | string
`highlighted` | boolean
`sortOrder` | number

## Example

```typescript
import type { ProductUI } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "displayName": Professional,
  "tagline": For growing teams,
  "features": [Unlimited projects, Priority support],
  "badge": Popular,
  "ctaText": Get Started,
  "highlighted": true,
  "sortOrder": 1,
} satisfies ProductUI

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductUI
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


