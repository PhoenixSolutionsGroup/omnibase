
# UserTenantListItem


## Properties

Name | Type
------------ | -------------
`isActive` | boolean
`tenant` | [GetTenantByIDRow](GetTenantByIDRow.md)

## Example

```typescript
import type { UserTenantListItem } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "isActive": null,
  "tenant": null,
} satisfies UserTenantListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserTenantListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


