# Type Alias: AuthProviderProps

> **AuthProviderProps** = `object`

Defined in: [context/provider.tsx:22](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/react/src/context/provider.tsx#L22)

Configuration properties for the authentication provider

## Example

```tsx
const props: AuthProviderProps = {
  basePath: 'http://localhost:4000',
  children: <App />
};
```

## Since

0.2.0

## Properties

### basePath

> **basePath**: `string`

Defined in: [context/provider.tsx:24](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/react/src/context/provider.tsx#L24)

Base URL for the Omnibase API endpoint

***

### children

> **children**: `ReactNode`

Defined in: [context/provider.tsx:27](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/react/src/context/provider.tsx#L27)

React children components to be wrapped by the provider
