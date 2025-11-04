# Tenants

Tenants module

This module provides comprehensive tenant management functionality using
an object-oriented approach with dedicated handler classes. The module
supports multi-tenant applications with user management, invitations,
and tenant switching capabilities.

Key features:
- Tenant lifecycle management (create, delete, switch)
- User invitation system with email workflows
- Multi-tenant user management and permissions
- Active tenant switching for user sessions
- Comprehensive error handling and validation
- Integration with Stripe for billing management

## Example

Basic usage with the main TenantHandler:
```typescript
import { TenantHandler } from '@omnibase/core-js/tenants';

// Initialize the handler with your client
const tenantHandler = new TenantHandler(omnibaseClient);

// Create a new tenant
const tenant = await tenantHandler.manage.createTenant({
  name: 'My Company',
  billing_email: 'billing@company.com',
  user_id: 'user_123'
});

// Invite a user to the tenant
const invite = await tenantHandler.invites.create({
  email: 'user@example.com',
  role: 'member',
  invite_url: 'https://yourapp.com/accept-invite'
});

// Switch active tenant
await tenantHandler.manage.switchActiveTenant(tenant.data.tenant.id);
```

## Tenant Management

- [TenantHandler](classes/TenantHandler.md)
- [TenantManger](classes/TenantManger.md)
- [CreateTenantRequest](type-aliases/CreateTenantRequest.md)
- [CreateTenantResponse](type-aliases/CreateTenantResponse.md)
- [DeleteTenantResponse](type-aliases/DeleteTenantResponse.md)
- [SwitchActiveTenantResponse](type-aliases/SwitchActiveTenantResponse.md)
- [Tenant](type-aliases/Tenant.md)

## Tenant Invitations

- [TenantInviteManager](classes/TenantInviteManager.md)
- [AcceptTenantInviteRequest](type-aliases/AcceptTenantInviteRequest.md)
- [AcceptTenantInviteResponse](type-aliases/AcceptTenantInviteResponse.md)
- [CreateTenantUserInviteRequest](type-aliases/CreateTenantUserInviteRequest.md)
- [CreateTenantUserInviteResponse](type-aliases/CreateTenantUserInviteResponse.md)
- [TenantInvite](type-aliases/TenantInvite.md)
