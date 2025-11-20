
# EmailTemplate


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`subject` | string
`htmlBody` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { EmailTemplate } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "id": 550e8400-e29b-41d4-a716-446655440000,
  "type": welcome,
  "subject": Welcome to Test Platform,
  "htmlBody": <h1>Welcome!</h1><p>Thanks for joining our test platform.</p>,
  "createdAt": 2025-11-10T00:18:19.653645Z,
  "updatedAt": 2025-11-10T00:33:08.726632Z,
} satisfies EmailTemplate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EmailTemplate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


