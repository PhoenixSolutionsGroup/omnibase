# Auth

Authentication module

This module provides comprehensive authentication flow types and session management
for OmniBase applications. It integrates with Ory Kratos to support multiple
authentication flows including user registration, login, account recovery,
email verification, and user settings management.

Key features:
- Login flows with multiple authentication methods
- User registration with customizable identity schemas
- Account recovery via email or other channels
- Email and phone verification flows
- User settings management (profile, password updates)
- Session management with device tracking
- Multi-factor authentication support
- Logout flows with proper session termination

All authentication flows follow the Ory Kratos self-service pattern, where
flows are initiated, processed, and completed through a series of API calls.
Each flow type provides the necessary structure and validation for secure
user interactions.

## Examples

Basic usage with flow types:
```typescript
import type { LoginFlow, RegistrationFlow, Session } from '@omnibase/core-js/auth';

// Handle login flow
function handleLogin(flow: LoginFlow) {
  // Process login form with flow.ui.nodes
  console.log('Login methods available:', flow.ui.nodes.length);
}

// Check session validity
function isSessionValid(session: Session): boolean {
  return session.active === true &&
         session.expires_at ? new Date(session.expires_at) > new Date() : false;
}
```

Working with different flow types:
```typescript
import type { FlowType, LoginFlow, RegistrationFlow } from '@omnibase/core-js/auth';

function processFlow(flow: FlowType) {
  switch (flow.type) {
    case 'login':
      return handleLoginFlow(flow as LoginFlow);
    case 'registration':
      return handleRegistrationFlow(flow as RegistrationFlow);
    default:
      throw new Error(`Unsupported flow type: ${flow.type}`);
  }
}
```

## Type Aliases

- [FlowType](type-aliases/FlowType.md)
- [LoginFlow](type-aliases/LoginFlow.md)
- [LogoutFlow](type-aliases/LogoutFlow.md)
- [RecoveryFlow](type-aliases/RecoveryFlow.md)
- [RegistrationFlow](type-aliases/RegistrationFlow.md)
- [Session](type-aliases/Session.md)
- [SettingsFlow](type-aliases/SettingsFlow.md)
- [VerificationFlow](type-aliases/VerificationFlow.md)
