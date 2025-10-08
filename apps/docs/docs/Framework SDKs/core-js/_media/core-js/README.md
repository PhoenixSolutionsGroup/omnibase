# @omnibase/core-js


***


OmniBase Core SDK - Comprehensive authentication and multi-tenant platform integration

The OmniBase Core SDK provides everything you need to integrate with the OmniBase platform,
including comprehensive authentication flows via Ory Kratos, multi-tenant management, user
invitations, and database operations. Built for both browser and Node.js environments with
full TypeScript support.

[![npm version](https://badge.fury.io/js/%40omnibase%2Fcore-js.svg)](https://badge.fury.io/js/%40omnibase%2Fcore-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🔐 **Authentication Flows** - Complete Ory Kratos integration with login, registration, recovery, settings, and verification
- 🏢 **Multi-tenant Management** - Organization lifecycle management with billing integration
- 👥 **User Invitations** - Secure tenant user invitation and acceptance workflows
- 🔄 **Tenant Switching** - Seamless switching between multiple tenant contexts
- 🗄️ **Database Integration** - Supabase PostgREST client for advanced database operations
- 🛡️ **Type Safe** - Full TypeScript definitions with comprehensive type safety
- 🌐 **Universal** - Works in browser and Node.js environments
- 🔒 **Secure** - HTTP-only cookies and JWT token-based authentication

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
npm install @omnibase/core-js
# or
yarn add @omnibase/core-js
# or
pnpm add @omnibase/core-js
# or
bun add @omnibase/core-js
```

## Modules

- **Authentication** - Ory Kratos flow management for login, registration, recovery, settings, and verification flows
- **Tenants** - Multi-tenant organization management including creation, deletion, user invitations, and tenant switching
- **Database** - Supabase PostgREST client for direct database access and advanced queries

## Authentication Integration

The SDK integrates seamlessly with Ory Kratos self-service authentication flows:

```typescript
import type {
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
  Session,
  FlowType
} from '@omnibase/core-js';

// Type-safe flow handling
function handleAuthFlow(flow: FlowType) {
  switch (flow.type) {
    case 'login':
      return processLoginFlow(flow as LoginFlow);
    case 'registration':
      return processRegistrationFlow(flow as RegistrationFlow);
    case 'recovery':
      return processRecoveryFlow(flow as RecoveryFlow);
    default:
      throw new Error(`Unsupported flow type: ${flow.type}`);
  }
}

// Session validation
function isSessionValid(session: Session): boolean {
  return session.active === true &&
         session.expires_at ? new Date(session.expires_at) > new Date() : false;
}
```

## Multi-tenant Examples

### Complete Tenant Workflow

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

### Tenant Management

```typescript
import { deleteTenant, type ApiResponse } from '@omnibase/core-js';

// Delete a tenant
const deleteResult = await deleteTenant('tenant-uuid');
if (deleteResult.status === 200) {
  console.log('Tenant successfully deleted');
} else {
  console.error('Failed to delete tenant:', deleteResult.error);
}
```

## Database Integration

```typescript
import { createClient } from '@omnibase/core-js';

// Create database client for advanced operations
const db = createClient({
  url: process.env.DATABASE_URL || 'your-database-url',
  // additional PostgREST client options
});

// Use the client for direct database operations
const { data, error } = await db
  .from('tenants')
  .select('*')
  .eq('active', true);

if (error) {
  console.error('Database query failed:', error);
} else {
  console.log('Active tenants:', data);
}
```

## Type Definitions

The SDK provides comprehensive TypeScript types for all operations:

```typescript
import type {
  // Authentication types
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
  LogoutFlow,
  Session,
  FlowType,

  // Tenant types
  Tenant,
  CreateTenantRequest,
  CreateTenantResponse,
  CreateTenantUserInviteRequest,
  CreateTenantUserInviteResponse,
  AcceptTenantInviteResponse,
  SwitchActiveTenantResponse,
  DeleteTenantResponse,
  ApiResponse
} from '@omnibase/core-js';
```

## Error Handling

All SDK functions return consistent `ApiResponse` types with proper error handling:

```typescript
try {
  const result = await createTenant({
    name: 'My Tenant',
    billing_email: 'billing@example.com',
    user_id: 'user-123'
  });

  if (result.status === 200 && result.data) {
    console.log('Tenant created:', result.data.tenant);
  } else {
    console.error('Failed to create tenant:', result.error);
  }
} catch (error) {
  console.error('Network or unexpected error:', error);
}
```

## Environment Configuration

The SDK requires environment configuration for proper operation:

```bash
# Required environment variables
OMNIBASE_API_URL=https://your-api-endpoint.com

# Optional database configuration
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Security Features

- **HTTP-only Cookies** - Secure session management resistant to XSS attacks
- **JWT Tokens** - Row-level security (RLS) policy support for database operations
- **CSRF Protection** - Built-in protection against cross-site request forgery
- **Flow-based Authentication** - Secure, stateful authentication flows via Ory Kratos
- **Token Expiration** - Automatic handling of invitation token expiration

## Environment Support

- ✅ **Browser** - Works in all modern browsers with proper CORS handling
- ✅ **Node.js** - Version 16+ supported with full server-side functionality
- ✅ **React/Vue/Angular** - Framework agnostic with TypeScript support
- ✅ **TypeScript** - Full type definitions included with comprehensive coverage
- ✅ **ESM/CJS** - Supports both module formats for maximum compatibility
- ✅ **Edge Runtime** - Compatible with Vercel Edge, Cloudflare Workers, and similar platforms

## Related Packages

- [`@omnibase/sdk-nextjs`](../sdk-nextjs) - Next.js optimized SDK with middleware and server components
- [`@omnibase/sdk-shadcn`](../sdk-shadcn) - Pre-built UI components with shadcn/ui integration

## Architecture

The SDK is built around three core architectural concepts:

1. **Authentication Flows** - Comprehensive Ory Kratos integration handling all user authentication states and transitions
2. **Multi-tenant Context** - Complete organizational boundary management with billing integration and user access control
3. **Database Integration** - Direct Supabase PostgREST access for advanced queries and data operations

Each module is designed to work independently or together, allowing you to use only the parts you need for your specific integration requirements. The SDK maintains consistency across all operations with standardized response types and error handling patterns.

## Interfaces

- [TenantInvite](interfaces/TenantInvite.md)

## Type Aliases

- [FlowType](type-aliases/FlowType.md)
- [LogoutFlow](type-aliases/LogoutFlow.md)
- [LoginFlow](type-aliases/LoginFlow.md)
- [RecoveryFlow](type-aliases/RecoveryFlow.md)
- [VerificationFlow](type-aliases/VerificationFlow.md)
- [RegistrationFlow](type-aliases/RegistrationFlow.md)
- [SettingsFlow](type-aliases/SettingsFlow.md)
- [Session](type-aliases/Session.md)
- [AcceptTenantInviteRequest](type-aliases/AcceptTenantInviteRequest.md)
- [AcceptTenantInviteResponse](type-aliases/AcceptTenantInviteResponse.md)
- [CreateTenantUserInviteResponse](type-aliases/CreateTenantUserInviteResponse.md)
- [CreateTenantUserInviteRequest](type-aliases/CreateTenantUserInviteRequest.md)
- [CreateTenantResponse](type-aliases/CreateTenantResponse.md)
- [Tenant](type-aliases/Tenant.md)
- [CreateTenantRequest](type-aliases/CreateTenantRequest.md)
- [DeleteTenantResponse](type-aliases/DeleteTenantResponse.md)
- [SwitchActiveTenantResponse](type-aliases/SwitchActiveTenantResponse.md)
- [ApiResponse](type-aliases/ApiResponse.md)

## Functions

- [createClient](functions/createClient.md)
- [acceptTenantInvite](functions/acceptTenantInvite.md)
- [createTenantUserInvite](functions/createTenantUserInvite.md)
- [createTenant](functions/createTenant.md)
- [deleteTenant](functions/deleteTenant.md)
- [switchActiveTenant](functions/switchActiveTenant.md)
