# Type Alias: SettingsFlow

> **SettingsFlow** = `Settings`

Defined in: auth/types.ts:294

Settings flow for user profile and account management

This flow enables users to update their account settings in a self-service manner.
It supports updating profile information, changing passwords, managing two-factor
authentication, updating email addresses, and other account-related settings.
The flow enforces proper validation and security measures for sensitive changes.

## Examples

Profile update handling:
```typescript
function handleProfileSettings(flow: SettingsFlow) {
  const profileFields = flow.ui.nodes
    .filter(node => node.group === 'profile')
    .map(node => ({
      name: node.attributes.name,
      value: node.attributes.value,
      type: node.attributes.type,
      required: node.attributes.required
    }));

  return {
    action: flow.ui.action,
    method: flow.ui.method,
    fields: profileFields
  };
}
```

Password change flow:
```typescript
function handlePasswordChange(flow: SettingsFlow) {
  const passwordNodes = flow.ui.nodes.filter(
    node => node.group === 'password'
  );

  return passwordNodes.map(node => ({
    name: node.attributes.name,
    label: node.meta?.label?.text || node.attributes.name,
    required: node.attributes.required || false
  }));
}
```

## Since

0.1.0
