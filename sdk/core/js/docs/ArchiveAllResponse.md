
# ArchiveAllResponse


## Properties

Name | Type
------------ | -------------
`message` | string
`archivedItems` | Array&lt;string&gt;
`archiveErrors` | Array&lt;string&gt;
`totalArchived` | number
`totalErrors` | number
`warning` | string

## Example

```typescript
import type { ArchiveAllResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "message": Successfully archived all Stripe resources and cleared local config,
  "archivedItems": [product: prod_123 (Basic Plan), price: price_456],
  "archiveErrors": [],
  "totalArchived": 15,
  "totalErrors": 0,
  "warning": Some items failed to archive - see archive_errors for details,
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


