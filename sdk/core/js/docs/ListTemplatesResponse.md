
# ListTemplatesResponse


## Properties

Name | Type
------------ | -------------
`count` | number
`templates` | [Array&lt;EmailTemplate&gt;](EmailTemplate.md)

## Example

```typescript
import type { ListTemplatesResponse } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "count": null,
  "templates": null,
} satisfies ListTemplatesResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ListTemplatesResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


