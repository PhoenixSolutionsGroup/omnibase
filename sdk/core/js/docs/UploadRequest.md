
# UploadRequest


## Properties

Name | Type
------------ | -------------
`path` | string
`metadata` | object

## Example

```typescript
import type { UploadRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "path": avatars/user-123.png,
  "metadata": {content_type=image/png, size=1024},
} satisfies UploadRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UploadRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


