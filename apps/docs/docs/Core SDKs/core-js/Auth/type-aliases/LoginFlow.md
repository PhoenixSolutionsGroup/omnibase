# Type Alias: LoginFlow

> **LoginFlow** = `Login`

Defined in: auth/types.ts:134

Login flow for user authentication

Represents a complete login flow initiated through Ory Kratos. This flow handles
various authentication methods including password-based login, social providers,
and multi-factor authentication. The flow contains all necessary UI elements
and validation rules for rendering secure login forms.

Key properties:
- `ui`: Contains form nodes with input fields, buttons, and validation messages
- `oauth2_login_challenge`: OAuth2 challenge for federated login scenarios
- `refresh`: Indicates if this is a forced re-authentication
- `request_url`: Original URL that initiated the flow

## Examples

Processing login form:
```typescript
function renderLoginForm(flow: LoginFlow) {
  const emailField = flow.ui.nodes.find(
    node => node.attributes.name === 'identifier'
  );
  const passwordField = flow.ui.nodes.find(
    node => node.attributes.name === 'password'
  );

  // Render form with these fields
  return {
    action: flow.ui.action,
    method: flow.ui.method,
    fields: [emailField, passwordField]
  };
}
```

Handling social login:
```typescript
function getSocialProviders(flow: LoginFlow) {
  return flow.ui.nodes
    .filter(node => node.group === 'oidc')
    .map(node => ({
      provider: node.attributes.value,
      name: node.meta?.label?.text || 'Unknown Provider'
    }));
}
```

## Since

0.1.0
