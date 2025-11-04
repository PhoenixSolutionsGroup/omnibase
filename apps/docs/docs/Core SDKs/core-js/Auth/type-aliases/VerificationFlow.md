# Type Alias: VerificationFlow

> **VerificationFlow** = `Verification`

Defined in: [auth/types.ts:199](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/auth/types.ts#L199)

Verification flow for validating communication channels

Used to verify out-of-band communication channels such as email addresses
or phone numbers. This flow ensures that users have access to the contact
methods they've provided, which is essential for account security and
communication delivery.

## Example

Email verification handling:
```typescript
function handleEmailVerification(flow: VerificationFlow) {
  if (flow.state === 'sent_email') {
    return {
      message: 'Verification email sent. Please check your inbox.',
      canResend: true
    };
  }

  if (flow.state === 'passed_challenge') {
    return {
      message: 'Email verified successfully!',
      redirect: '/dashboard'
    };
  }
}
```

## Since

0.1.0
