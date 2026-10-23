
# SendRequest


## Properties

Name | Type
------------ | -------------
`body` | string
`data` | object
`plain` | string
`subject` | string
`templateType` | string
`to` | string

## Example

```typescript
import type { SendRequest } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "body": null,
  "data": null,
  "plain": null,
  "subject": null,
  "templateType": null,
  "to": null,
} satisfies SendRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SendRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


