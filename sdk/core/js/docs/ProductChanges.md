
# ProductChanges

Summary of product changes made during configuration update

## Properties

Name | Type
------------ | -------------
`created` | [Array&lt;ProductChange&gt;](ProductChange.md)
`updated` | [Array&lt;ProductChange&gt;](ProductChange.md)
`archived` | [Array&lt;ProductChange&gt;](ProductChange.md)

## Example

```typescript
import type { ProductChanges } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "created": null,
  "updated": null,
  "archived": null,
} satisfies ProductChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


