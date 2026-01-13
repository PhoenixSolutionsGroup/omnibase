
# SessionResponse


## Properties

Name | Type
------------ | -------------
`session` | object
`identity` | object
`tenant` | [Tenant](Tenant.md)

## Example

```typescript
import type { SessionResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "session": null,
  "identity": null,
  "tenant": null,
} satisfies SessionResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SessionResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


