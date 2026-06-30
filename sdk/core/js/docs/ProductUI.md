
# ProductUI


## Properties

Name | Type
------------ | -------------
`badge` | string
`ctaText` | string
`displayName` | string
`features` | Array&lt;string&gt;
`highlighted` | boolean
`sortOrder` | number
`tagline` | string

## Example

```typescript
import type { ProductUI } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "badge": null,
  "ctaText": null,
  "displayName": null,
  "features": null,
  "highlighted": null,
  "sortOrder": null,
  "tagline": null,
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


