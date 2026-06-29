
# GetEmailTemplates200Response


## Properties

Name | Type
------------ | -------------
`templates` | [Array&lt;EmailTemplate&gt;](EmailTemplate.md)
`count` | number

## Example

```typescript
import type { GetEmailTemplates200Response } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "templates": null,
  "count": 3,
} satisfies GetEmailTemplates200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetEmailTemplates200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


