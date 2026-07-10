
# ConfigResponse


## Properties

Name | Type
------------ | -------------
`changes` | [ConfigChanges](ConfigChanges.md)
`config` | [StripeConfiguration](StripeConfiguration.md)
`errors` | Array&lt;string&gt;
`message` | string

## Example

```typescript
import type { ConfigResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "changes": null,
  "config": null,
  "errors": null,
  "message": null,
} satisfies ConfigResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


