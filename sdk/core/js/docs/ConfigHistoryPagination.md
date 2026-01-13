
# ConfigHistoryPagination


## Properties

Name | Type
------------ | -------------
`total` | number
`page` | number
`perPage` | number
`totalPages` | number
`hasNext` | boolean
`hasPrev` | boolean

## Example

```typescript
import type { ConfigHistoryPagination } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "total": 2,
  "page": 1,
  "perPage": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrev": false,
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


