# Type Alias: AuthProviderProps

> **AuthProviderProps** = `object`

Defined in: context/provider.tsx:22

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

Defined in: context/provider.tsx:24

Base URL for the Omnibase API endpoint

***

### children

> **children**: `ReactNode`

Defined in: context/provider.tsx:27

React children components to be wrapped by the provider
