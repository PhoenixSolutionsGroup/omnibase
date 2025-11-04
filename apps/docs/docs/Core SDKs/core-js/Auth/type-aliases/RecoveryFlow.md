# Type Alias: RecoveryFlow

> **RecoveryFlow** = `Recovery`

Defined in: [auth/types.ts:166](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L166)

Account recovery flow for password reset and account recovery

This flow enables users to recover their accounts through various recovery
methods such as email-based password reset or account unlock procedures.
The recovery process is typically initiated when a user cannot access their
account due to forgotten credentials or account lockout.

## Example

Initiating account recovery:
```typescript
function handleRecovery(flow: RecoveryFlow) {
  const emailField = flow.ui.nodes.find(
    node => node.attributes.name === 'email'
  );

  if (emailField) {
    // Render email input for recovery
    return {
      action: flow.ui.action,
      method: flow.ui.method,
      placeholder: 'Enter your email address'
    };
  }
}
```

## Since

0.1.0
