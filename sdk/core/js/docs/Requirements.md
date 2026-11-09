
# Requirements


## Properties

Name | Type
------------ | -------------
`files` | Array&lt;any&gt;
`namespaces` | [Array&lt;ParsedNamespaceDefinition&gt;](ParsedNamespaceDefinition.md)

## Example

```typescript
import type { Requirements } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "files": null,
  "namespaces": null,
} satisfies Requirements

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Requirements
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


