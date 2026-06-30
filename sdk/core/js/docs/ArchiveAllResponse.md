
# ArchiveAllResponse


## Properties

Name | Type
------------ | -------------
`archiveErrors` | Array&lt;string&gt;
`archivedItems` | Array&lt;string&gt;
`message` | string
`totalArchived` | number
`totalErrors` | number
`warning` | string

## Example

```typescript
import type { ArchiveAllResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "archiveErrors": null,
  "archivedItems": null,
  "message": null,
  "totalArchived": null,
  "totalErrors": null,
  "warning": null,
} satisfies ArchiveAllResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ArchiveAllResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


