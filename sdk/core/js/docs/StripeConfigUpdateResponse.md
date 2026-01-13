
# StripeConfigUpdateResponse


## Properties

Name | Type
------------ | -------------
`message` | string
`changes` | [StripeConfigChanges](StripeConfigChanges.md)
`config` | [StripeConfiguration](StripeConfiguration.md)
`errors` | Array&lt;string&gt;

## Example

```typescript
import type { StripeConfigUpdateResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": Configuration updated successfully,
  "changes": null,
  "config": null,
  "errors": [],
} satisfies StripeConfigUpdateResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as StripeConfigUpdateResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


