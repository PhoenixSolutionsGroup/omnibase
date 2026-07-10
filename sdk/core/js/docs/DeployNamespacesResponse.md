
# DeployNamespacesResponse


## Properties

Name | Type
------------ | -------------
`managedMode` | boolean
`message` | string
`path` | string
`rolesSynced` | number
`tenantId` | string

## Example

```typescript
import type { DeployNamespacesResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "managedMode": null,
  "message": null,
  "path": null,
  "rolesSynced": null,
  "tenantId": null,
} satisfies DeployNamespacesResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeployNamespacesResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


