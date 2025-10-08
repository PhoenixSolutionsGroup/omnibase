# Function: FlowRouter()

> **FlowRouter**(`props`): `Promise`\<`ReactElement`\<`unknown`, string \| JSXElementConstructor\<any\>\> \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `AwaitedReactNode`\>

Defined in: src/auth/flow-router.ts:133

Routes auth flows to their corresponding components based on URL parameters.

## Parameters

### props

[`FlowRouterProps`](../interfaces/FlowRouterProps.md)

The router props

## Returns

`Promise`\<`ReactElement`\<`unknown`, string \| JSXElementConstructor\<any\>\> \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `AwaitedReactNode`\>

The component for the current flow type

## Example

```tsx
// In your app/auth/[...flow]/page.tsx
import { FlowRouter } from '@omnibase/nextjs';
import { LoginForm, RegisterForm } from './components';

export default function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ flow: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined; }>;
}) {
  return (
    <FlowRouter
      params={params}
      searchParams={searchParams}
      url="/auth"
      flowMap={{
        login: (flow) => <LoginForm flow={flow} />,
        registration: (flow) => <RegisterForm flow={flow} />,
      }}
      onNotFound={<div>Auth flow not supported</div>}
    />
  );
}
```
