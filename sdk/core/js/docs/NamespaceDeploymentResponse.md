
# NamespaceDeploymentResponse


## Properties

Name | Type
------------ | -------------
`message` | string
`tenantId` | string
`path` | string
`managedMode` | boolean
`rolesSynced` | number

## Example

```typescript
import type { NamespaceDeploymentResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": Namespaces deployed successfully,
  "tenantId": tenant_test_123,
  "path": tenant_test_123/latest.zip,
  "managedMode": true,
  "rolesSynced": 5,
} satisfies NamespaceDeploymentResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NamespaceDeploymentResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


