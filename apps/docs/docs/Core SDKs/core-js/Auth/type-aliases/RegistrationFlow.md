# Type Alias: RegistrationFlow

> **RegistrationFlow** = `Registration`

Defined in: [auth/types.ts:244](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L244)

Registration flow for new user account creation

Handles the complete user registration process including identity validation,
password requirements, and any custom registration fields defined in the
identity schema. The registration flow can include email verification,
terms acceptance, and integration with external identity providers.

## Examples

Processing registration form:
```typescript
function buildRegistrationForm(flow: RegistrationFlow) {
  const passwordNode = flow.ui.nodes.find(
    node => node.attributes.name === 'password'
  );

  const requirements = passwordNode?.messages?.map(msg => msg.text) || [];

  return {
    action: flow.ui.action,
    method: flow.ui.method,
    passwordRequirements: requirements,
    hasTerms: flow.ui.nodes.some(node => node.attributes.name === 'terms')
  };
}
```

Handling registration validation:
```typescript
function getRegistrationErrors(flow: RegistrationFlow) {
  return flow.ui.nodes.reduce((errors, node) => {
    if (node.messages && node.messages.length > 0) {
      errors[node.attributes.name] = node.messages[0].text;
    }
    return errors;
  }, {} as Record<string, string>);
}
```

## Since

0.1.0
