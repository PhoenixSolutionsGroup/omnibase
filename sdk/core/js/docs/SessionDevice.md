
# SessionDevice


## Properties

Name | Type
------------ | -------------
`additionalProperties` | object
`id` | string
`ipAddress` | string
`location` | string
`userAgent` | string

## Example

```typescript
import type { SessionDevice } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "additionalProperties": null,
  "id": null,
  "ipAddress": null,
  "location": null,
  "userAgent": null,
} satisfies SessionDevice

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SessionDevice
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


