
# ApplyEnterpriseCustomRequest


## Properties

Name | Type
------------ | -------------
`tenantId` | string
`enterpriseId` | string

## Example

```typescript
import type { ApplyEnterpriseCustomRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "tenantId": 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  "enterpriseId": acme_corp,
} satisfies ApplyEnterpriseCustomRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApplyEnterpriseCustomRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


