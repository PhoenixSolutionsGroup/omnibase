# GetStorageCredentialsResponse

## Properties

| Name           | Type   |
| -------------- | ------ |
| `accessKey`    | string |
| `bucketName`   | string |
| `endpoint`     | string |
| `expiration`   | Date   |
| `region`       | string |
| `secretKey`    | string |
| `sessionToken` | string |

## Example

```typescript
import type { GetStorageCredentialsResponse } from "@omnibase/core-js";

// TODO: Update the object below with actual values
const example = {
	accessKey: null,
	bucketName: null,
	endpoint: null,
	expiration: null,
	region: null,
	secretKey: null,
	sessionToken: null,
} satisfies GetStorageCredentialsResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetStorageCredentialsResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
