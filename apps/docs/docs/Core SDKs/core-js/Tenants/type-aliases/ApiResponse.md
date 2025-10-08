# Type Alias: ApiResponse\<T\>

> **ApiResponse**\<`T`\> = `object`

Defined in: tenants/types.ts:31

Base API Response structure for all tenant operations

This generic type defines the standard response format returned by all
tenant-related API endpoints. It provides a consistent structure for
handling both successful responses and error conditions across the SDK.

## Examples

Successful response:
```typescript
const response: ApiResponse<{ tenant: Tenant }> = {
  data: { tenant: { id: '123', name: 'My Company' } },
  status: 200
};
```

Error response:
```typescript
const response: ApiResponse<never> = {
  status: 400,
  error: 'Invalid tenant name provided'
};
```

## Since

1.0.0

## Type Parameters

### T

`T`

The type of the response data payload

## Properties

### data?

> `optional` **data**: `T`

Defined in: tenants/types.ts:36

Response data payload (present only on successful operations)
Contains the actual data returned by the API endpoint

***

### error?

> `optional` **error**: `string`

Defined in: tenants/types.ts:48

Error message (present only when operation fails)
Provides human-readable description of what went wrong

***

### status

> **status**: `number`

Defined in: tenants/types.ts:42

HTTP status code indicating the result of the operation

#### Example

```ts
200 for success, 400 for client errors, 500 for server errors
```
