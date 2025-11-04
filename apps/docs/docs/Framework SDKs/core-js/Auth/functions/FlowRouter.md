# Function: FlowRouter()

> **FlowRouter**(`props`): `Promise`\<`ReactElement`\<`unknown`, string \| JSXElementConstructor\<any\>\> \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `AwaitedReactNode`\>

Defined in: [src/auth/flow-router.ts:206](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/nextjs/src/auth/flow-router.ts#L206)

Routes authentication flows to their corresponding components based on URL parameters

FlowRouter is a server component that dynamically renders the appropriate authentication
UI based on the URL path. It fetches the flow data from Ory Kratos and passes it to
the corresponding render function from the flowMap. This component is designed for
Next.js 13+ App Router with catch-all routes.

The router extracts the flow type from the URL (e.g., `/auth/login` → `login`),
retrieves the flow object, and invokes the matching render function with the flow data.

## Parameters

### props

[`FlowRouterProps`](../interfaces/FlowRouterProps.md)

Configuration props for the router

## Returns

`Promise`\<`ReactElement`\<`unknown`, string \| JSXElementConstructor\<any\>\> \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `AwaitedReactNode`\>

Promise resolving to the rendered component for the current flow

## Example

```tsx
// In your app/auth/[...flow]/page.tsx
import { FlowRouter } from '@omnibase/nextjs/auth';
import { LoginForm, RegistrationForm, RecoveryForm } from '@omnibase/shadcn';

export default function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ flow: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <FlowRouter
      params={params}
      searchParams={searchParams}
      url="/auth"
      returnTo="/"
      flowMap={{
        login: (flow) => <LoginForm flow={flow} register_url="/auth/registration" />,
        registration: (flow) => <RegistrationForm flow={flow} login_url="/auth/login" />,
        recovery: (flow) => <RecoveryForm flow={flow} />,
      }}
      onNotFound={<div>Authentication flow not supported</div>}
    />
  );
}
```

## Since

0.5.1
