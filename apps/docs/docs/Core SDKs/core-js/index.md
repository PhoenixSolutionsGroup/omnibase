# @omnibase/core-js

**Comprehensive authentication and multi-tenant platform integration**

The OmniBase Core SDK provides everything you need to integrate with the OmniBase platform, including comprehensive authentication flows via Ory Kratos, multi-tenant management, user invitations, and database operations. Built for both browser and Node.js environments with full TypeScript support.

![npm version](https://img.shields.io/npm/v/@omnibase/core-js)
![License](https://img.shields.io/npm/l/@omnibase/core-js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features

| Feature | Description | Documentation |
|---------|-------------|---------------|
| Authentication Flows | Complete Ory Kratos integration with login, registration, recovery, settings, and verification | [Auth Docs](https://docs.omnibase.dev) |
| Multi-tenant Management | Organization lifecycle management with billing integration | [Tenant Docs](https://docs.omnibase.dev) |
| User Invitations | Secure tenant user invitation and acceptance workflows | [Invitation Docs](https://docs.omnibase.dev) |
| Tenant Switching | Seamless switching between multiple tenant contexts | [Context Docs](https://docs.omnibase.dev) |
| Database Integration | Supabase PostgREST client for advanced database operations | [Database Docs](https://docs.omnibase.dev) |
| Type Safety | Full TypeScript definitions with comprehensive type coverage | [API Reference](https://docs.omnibase.dev) |

## Quick Start

```typescript
import {
  createTenant,
  switchActiveTenant,
  createTenantUserInvite,
  acceptTenantInvite
} from '@omnibase/core-js';

// Create a new tenant
const tenant = await createTenant({
  name: 'My Company',
  billing_email: 'billing@company.com',
  user_id: 'user_123'
});

if (tenant.status === 200 && tenant.data) {
  // Switch to the new tenant
  await switchActiveTenant(tenant.data.tenant.id);

  // Invite a user to the tenant
  const invite = await createTenantUserInvite(tenant.data.tenant.id, {
    email: 'colleague@company.com'
  });

  if (invite.status === 200 && invite.data) {
    console.log(`Invitation sent with token: ${invite.data.token}`);
  }
}
```

## Installation

```bash
# npm
npm install @omnibase/core-js

# yarn
yarn add @omnibase/core-js

# pnpm
pnpm add @omnibase/core-js

# bun
bun add @omnibase/core-js
```

## Modules Overview

The SDK is organized into three main modules:

- **Authentication** - Ory Kratos flow management for login, registration, recovery, settings, and verification flows with type-safe session handling
- **Tenants** - Multi-tenant organization management including creation, deletion, user invitations, and tenant switching with billing integration
- **Database** - Supabase PostgREST client for direct database access and advanced queries with row-level security support

## Complete Workflow Example

```typescript
import {
  createTenant,
  createTenantUserInvite,
  acceptTenantInvite,
  switchActiveTenant,
  deleteTenant,
  type CreateTenantRequest,
  type Tenant
} from '@omnibase/core-js';

// 1. Create a new tenant with billing
const tenantData: CreateTenantRequest = {
  name: 'Acme Corporation',
  billing_email: 'billing@acmecorp.com',
  user_id: 'current-user-id'
};

const newTenant = await createTenant(tenantData);
if (newTenant.status === 200 && newTenant.data) {
  console.log(`Created tenant: ${newTenant.data.tenant.name}`);

  // 2. Invite users to the tenant
  const invitation = await createTenantUserInvite(newTenant.data.tenant.id, {
    email: 'admin@acmecorp.com'
  });

  if (invitation.status === 200 && invitation.data) {
    console.log(`Invitation sent with token: ${invitation.data.token}`);

    // 3. Accept invitation (done by the invited user)
    const acceptance = await acceptTenantInvite({
      token: invitation.data.token
    });

    if (acceptance.status === 200 && acceptance.data) {
      console.log(`User joined tenant: ${acceptance.data.tenant_id}`);

      // 4. Switch active tenant context
      await switchActiveTenant(newTenant.data.tenant.id);
      console.log('Switched to new tenant context');
    }
  }
}
```

## Error Handling

All SDK functions return consistent `ApiResponse` types:

```typescript
const result = await createTenant({
  name: 'My Tenant',
  billing_email: 'billing@example.com',
  user_id: 'user-123'
});

if (result.status === 200 && result.data) {
  console.log('Tenant created:', result.data.tenant);
} else {
  console.error('Failed:', result.error);
}
```

## Environment Configuration

```bash
# Required: OmniBase authentication endpoint
OMNIBASE_AUTH_URL=https://your-auth-endpoint.com

# Optional: Database configuration for PostgREST client
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Security Features

| Feature | Description |
|---------|-------------|
| HTTP-only Cookies | Secure session management resistant to XSS attacks |
| JWT Tokens | Row-level security policy support for database operations |
| CSRF Protection | Built-in protection against cross-site request forgery |
| Flow-based Authentication | Secure, stateful authentication flows via Ory Kratos |
| Token Expiration | Automatic handling of invitation token expiration |

## Environment Support

| Environment | Status | Notes |
|-------------|--------|-------|
| Browser | ✅ | All modern browsers with CORS support |
| Node.js | ✅ | Version 16+ required |
| React/Vue/Angular | ✅ | Framework agnostic |
| TypeScript | ✅ | Full type definitions included |
| ESM/CJS | ✅ | Both module formats supported |
| Edge Runtime | ✅ | Vercel Edge, Cloudflare Workers compatible |

## Related Packages

- **[@omnibase/sdk-nextjs](https://www.npmjs.com/package/@omnibase/sdk-nextjs)** - Next.js optimized SDK with middleware and server components
- **[@omnibase/sdk-shadcn](https://www.npmjs.com/package/@omnibase/sdk-shadcn)** - Pre-built UI components with shadcn/ui integration

## Architecture

The SDK is built around three core concepts:

1. **Authentication Flows** - Comprehensive Ory Kratos integration handling all user authentication states and transitions
2. **Multi-tenant Context** - Complete organizational boundary management with billing integration and user access control
3. **Database Integration** - Direct Supabase PostgREST access for advanced queries and data operations

Each module works independently or together, allowing you to use only what you need. The SDK maintains consistency across all operations with standardized response types and error handling patterns.

## API Reference

For detailed API documentation including all types, interfaces, and functions, visit the [full API reference](https://docs.omnibase.dev).

## License

MIT

## Modules

- [Auth](Auth/index.md)
- [Database](Database/index.md)
- [Tenants](Tenants/index.md)
