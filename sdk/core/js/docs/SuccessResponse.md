
# SuccessResponse

Standard success response wrapper

## Properties

Name | Type
------------ | -------------
`status` | number
`data` | [SuccessResponseData](SuccessResponseData.md)

## Example

```typescript
import type { SuccessResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "status": 200,
  "data": null,
} satisfies SuccessResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SuccessResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


