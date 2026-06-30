
# EnterpriseApplyResponse


## Properties

Name | Type
------------ | -------------
`message` | string
`pricesSwapped` | number
`swappedDetails` | Array&lt;string&gt;
`tenantId` | string

## Example

```typescript
import type { EnterpriseApplyResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": null,
  "pricesSwapped": null,
  "swappedDetails": null,
  "tenantId": null,
} satisfies EnterpriseApplyResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EnterpriseApplyResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


