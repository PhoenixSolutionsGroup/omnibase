# LineItem

## Properties

| Name       | Type   |
| ---------- | ------ |
| `priceId`  | string |
| `quantity` | number |

## Example

```typescript
import type { LineItem } from "@omnibase/core-js";

// TODO: Update the object below with actual values
const example = {
	priceId: null,
	quantity: null,
} satisfies LineItem;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LineItem;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
