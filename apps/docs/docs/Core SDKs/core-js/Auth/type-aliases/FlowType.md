# Type Alias: FlowType

> **FlowType** = [`LoginFlow`](LoginFlow.md) \| [`RecoveryFlow`](RecoveryFlow.md) \| [`VerificationFlow`](VerificationFlow.md) \| [`RegistrationFlow`](RegistrationFlow.md) \| [`SettingsFlow`](SettingsFlow.md)

Defined in: auth/types.ts:51

Union type representing all possible authentication flow types

This type encompasses all self-service authentication flows supported by Ory Kratos.
Each flow type has its own specific structure and validation rules, but they all
follow the same general pattern of initialization, form rendering, and submission.

## Examples

Type guard for flow identification:
```typescript
function isLoginFlow(flow: FlowType): flow is LoginFlow {
  return flow.type === 'login';
}

function handleFlow(flow: FlowType) {
  if (isLoginFlow(flow)) {
    // Handle login-specific logic
    console.log('Processing login flow:', flow.id);
  }
}
```

Generic flow processing:
```typescript
function processFlowUI(flow: FlowType) {
  return flow.ui.nodes.map(node => ({
    name: node.attributes.name,
    type: node.type,
    required: node.attributes.required || false
  }));
}
```

## Since

0.1.0
