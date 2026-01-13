
# TenantSettings

Tenant configuration settings

## Properties

Name | Type
------------ | -------------
`tenantId` | string
`allowUserInvites` | boolean
`maxMembers` | number

## Example

```typescript
import type { TenantSettings } from '@omnibase/core-js'

// TODO: Update the object below with actual values
const example = {
  "tenantId": 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  "allowUserInvites": true,
  "maxMembers": 10,
} satisfies TenantSettings

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TenantSettings
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


