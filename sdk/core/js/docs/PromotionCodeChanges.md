
# PromotionCodeChanges


## Properties

Name | Type
------------ | -------------
`created` | [Array&lt;PromotionCodeChange&gt;](PromotionCodeChange.md)
`deactivated` | [Array&lt;PromotionCodeChange&gt;](PromotionCodeChange.md)
`updated` | [Array&lt;PromotionCodeChange&gt;](PromotionCodeChange.md)

## Example

```typescript
import type { PromotionCodeChanges } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "created": null,
  "deactivated": null,
  "updated": null,
} satisfies PromotionCodeChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PromotionCodeChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


