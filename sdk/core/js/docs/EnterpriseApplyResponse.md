
# EnterpriseApplyResponse


## Properties

Name | Type
------------ | -------------
`message` | string
`tenantId` | string
`pricesSwapped` | number
`swappedDetails` | Array&lt;string&gt;

## Example

```typescript
import type { EnterpriseApplyResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": Enterprise pricing applied successfully,
  "tenantId": 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  "pricesSwapped": 3,
  "swappedDetails": [basic_monthly -> basic_monthly_tier1 (subscription: sub_123)],
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


