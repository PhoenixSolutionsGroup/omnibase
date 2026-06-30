
# ConfigHistoryPagination


## Properties

Name | Type
------------ | -------------
`hasNext` | boolean
`hasPrev` | boolean
`page` | number
`perPage` | number
`total` | number
`totalPages` | number

## Example

```typescript
import type { ConfigHistoryPagination } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "hasNext": null,
  "hasPrev": null,
  "page": null,
  "perPage": null,
  "total": null,
  "totalPages": null,
} satisfies ConfigHistoryPagination

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ConfigHistoryPagination
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


