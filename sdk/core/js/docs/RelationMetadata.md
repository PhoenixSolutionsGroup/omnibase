
# RelationMetadata


## Properties

Name | Type
------------ | -------------
`displayName` | string
`group` | string
`name` | string
`roles` | Array&lt;string&gt;
`subGroup` | string
`subjects` | Array&lt;string&gt;

## Example

```typescript
import type { RelationMetadata } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "displayName": null,
  "group": null,
  "name": null,
  "roles": null,
  "subGroup": null,
  "subjects": null,
} satisfies RelationMetadata

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RelationMetadata
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


