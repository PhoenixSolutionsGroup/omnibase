
# EmailSystemTemplate


## Properties

Name | Type
------------ | -------------
`createdAt` | Date
`htmlBody` | string
`id` | string
`name` | string
`plaintextBody` | string
`subject` | string
`updatedAt` | Date

## Example

```typescript
import type { EmailSystemTemplate } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "createdAt": null,
  "htmlBody": null,
  "id": null,
  "name": null,
  "plaintextBody": null,
  "subject": null,
  "updatedAt": null,
} satisfies EmailSystemTemplate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EmailSystemTemplate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


