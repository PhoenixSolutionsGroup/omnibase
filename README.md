# OmniBase

**Self-hostable Backend-as-a-Service with Enterprise Billing Management**

OmniBase is a comprehensive, self-hostable Backend-as-a-Service platform that combines multi-tenant authentication, database-backed Stripe configuration management, edge functions, and container hosting. Built for developers who need enterprise-grade features with the flexibility to self-host or use managed infrastructure.

![Alpha](https://img.shields.io/badge/Status-Alpha-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

> ⚠️ **Alpha Status**: OmniBase is currently in alpha. Core features are functional but undergoing active development and testing. Some features may not work as expected. Not recommended for production use.

## Why OmniBase?

| Feature | Description | Status |
|---------|-------------|--------|
| **Multi-tenant Auth** | Production-ready authentication via Ory Kratos with built-in multi-tenancy support. Works equally well for single-tenant apps. | ✅ Ready |
| **Stripe as Code** | Revolutionary database-backed billing configuration system with versioning, rollbacks, and safe deployments. | ✅ Ready |
| **Edge Functions** | Deploy serverless functions to Cloudflare Workers for global low-latency compute. | ✅ Ready |
| **Container Hosting** | Deploy Docker containers for workloads requiring more compute than edge functions. | 🚧 In Progress |
| **Tenant Invitations** | Complete user invitation and acceptance flow for multi-tenant applications. | 🚧 In Progress |
| **Email Service** | Integrated email service for transactional and notification emails. | 🚧 In Progress |
| **File Storage** | S3-compatible object storage with tenant isolation. | ✅ Ready |
| **Row-Level Security** | PostgreSQL RLS with built-in helpers like `auth.active_tenant_id()` for data isolation. | ✅ Ready |
| **Permissions** | Fine-grained permissions via Ory Keto with tenant-aware relationships. | ✅ Ready |
| **Self-hostable** | Complete docker-compose setup for local development or self-hosted production. | ✅ Ready |

## The Stripe Innovation

OmniBase solves a critical problem in SaaS billing: **Stripe's configuration immutability**. Once a product or price has payment history, it cannot be deleted, making billing changes risky and complex.

### Traditional Approach (File-based)
```
❌ Can't safely delete or modify pricing
❌ No version control
❌ No rollback mechanism
❌ Manual migration scripts
❌ No audit trail
```

### OmniBase Approach (Database-backed)
```json
{
  "version": "2.1.0",
  "products": [{
    "id": "pro_plan",
    "name": "Professional",
    "prices": [{
      "id": "pro_monthly",
      "amount": 4900,
      "currency": "usd",
      "interval": "month"
    }]
  }]
}
```

```
✅ Version control for all billing configs
✅ Safe rollback to previous versions
✅ Complete audit trail and history
✅ Pull existing Stripe config to JSON
✅ Free tier support (bypass Stripe's $0 limitation)
✅ UI metadata stored with pricing
```

Each configuration version is stored in PostgreSQL and synced to Stripe. This enables enterprise features like:
- **Safe Deployment**: Deploy new pricing, manually rollback if issues arise
- **Version History**: View all past configurations with pagination
- **Audit Compliance**: Full history of all billing changes with timestamps
- **Free Tiers**: Support $0 pricing that Stripe doesn't allow
- **Reverse Sync**: Pull existing Stripe configs into versioned JSON format

## Quick Start (Alpha)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ or Bun
- Stripe account (for payment features)

### 1. Initialize Project

```bash
# Install OmniBase CLI
npm install -g omnibase-cli

# Initialize in your project directory
cd your-project
omnibase init

# This creates:
# - omnibase/ directory with configurations
# - stripe.config.json for billing setup
# - .env files for different environments
# - Docker Compose configuration
```

### 2. Configure Environment

Edit `omnibase/.env.dev`:

```bash
# Required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
DATABASE_URL=postgresql://user:pass@localhost:5432/omnibase

# Optional - for OAuth providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. Start Services

```bash
# Start all services (PostgreSQL, Kratos, Keto, API, etc.)
omnibase start

# Services available at:
# - API: http://localhost:8080
# - Kratos (Auth): http://localhost:4433
# - Keto (Permissions): http://localhost:4466
# - PostgreSQL: localhost:5432
```

### 4. Define Your Billing

Edit `omnibase/stripe.config.json`:

```json
{
  "version": "1.0.0",
  "products": [
    {
      "id": "free",
      "name": "Free Plan",
      "description": "Get started for free",
      "type": "service",
      "ui": {
        "display_name": "Free",
        "features": [
          "5 team members",
          "1GB storage",
          "Community support"
        ]
      },
      "prices": [{
        "id": "free",
        "amount": 0,
        "currency": "usd",
        "interval": "month"
      }]
    },
    {
      "id": "pro_plan",
      "name": "Professional",
      "description": "For growing teams",
      "type": "service",
      "ui": {
        "display_name": "Pro",
        "features": [
          "Unlimited team members",
          "100GB storage",
          "Priority support",
          "Advanced analytics"
        ]
      },
      "prices": [
        {
          "id": "pro_monthly",
          "amount": 4900,
          "currency": "usd",
          "interval": "month"
        },
        {
          "id": "pro_yearly",
          "amount": 49900,
          "currency": "usd",
          "interval": "year"
        }
      ]
    }
  ]
}
```

### 5. Deploy Configuration to Stripe

```bash
# Push config to Stripe and database
omnibase stripe push

# This creates:
# ✅ Products and prices in Stripe
# ✅ Version entry in PostgreSQL
# ✅ Complete audit trail
```

### 6. Use in Your Application

Install the SDK:

```bash
npm install @omnibase/core-js
# or
bun add @omnibase/core-js
```

#### Authentication

OmniBase uses Ory Kratos for authentication. The SDK exports authentication flow types and session management utilities. Authentication flows are handled through Ory Kratos's self-service API pattern.

```typescript
import { OmnibaseClient } from '@omnibase/core-js';
import type { LoginFlow, RegistrationFlow, Session } from '@omnibase/core-js/auth';

const omnibase = new OmnibaseClient({
  api_url: 'http://localhost:8080'
});

// Note: Authentication flows are managed through Ory Kratos directly
// The SDK provides TypeScript types for working with Kratos flows
// See Ory Kratos documentation for flow implementation details
```

#### Multi-tenant Operations

```typescript
// Create tenant (organization)
const tenant = await omnibase.tenants.manage.createTenant({
  name: 'Acme Corporation',
  billing_email: 'billing@acme.com',
  user_id: 'user_123'
});

// Switch active tenant context
await omnibase.tenants.manage.switchActiveTenant(tenant.data.tenant.id);

// Create user invitation
const invite = await omnibase.tenants.invites.create(
  tenant.data.tenant.id,
  {
    email: 'colleague@example.com',
    role: 'member'
  }
);

// Accept invitation (by invitee)
await omnibase.tenants.invites.accept(invite.token);

// Delete tenant (owner only)
await omnibase.tenants.manage.deleteTenant(tenant.data.tenant.id);
```

#### Stripe Integration

```typescript
// Create checkout session for subscription
const checkout = await omnibase.payments.checkout.createSession({
  price_id: 'pro_monthly',
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/pricing'
});

// Redirect to checkout
window.location.href = checkout.data.url;

// Record usage for metered billing
await omnibase.payments.usage.recordUsage({
  meter_event_name: 'api_calls',
  value: '100'
});

// Create customer portal session
const portal = await omnibase.payments.portal.create({
  return_url: 'https://yourapp.com/settings/billing'
});

// Redirect to portal
window.location.href = portal.data.url;

// Get billing configuration
const config = await omnibase.payments.config.getStripeConfig();

// Get UI-ready products for pricing tables
const products = await omnibase.payments.config.getAvailableProducts();
```

#### Row-Level Security with Multi-tenancy

```sql
-- Automatic tenant isolation in PostgreSQL
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy using built-in helper
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = auth.active_tenant_id());
```

```typescript
// Database queries use PostgREST client
import { createClient } from '@omnibase/core-js/database';

const db = createClient(
  'https://api.example.com/rest/v1',
  'your-anon-key',
  (name) => document.cookie.split('; ').find(row => row.startsWith(name))?.split('=')[1] || ''
);

// Queries automatically scoped to active tenant via RLS
const { data } = await db.from('projects').select('*');
// Only returns projects for current tenant
```

#### Permissions

```typescript
// Check permissions using Ory Keto
const result = await omnibase.permissions.permissions.checkPermission(
  undefined,
  {
    namespace: 'Tenant',
    object: tenant.data.tenant.id,
    relation: 'view',
    subjectId: 'user_456'
  }
);

if (result.data.allowed) {
  console.log('User has permission');
}

// Grant permission by creating a relationship
await omnibase.permissions.relationships.createRelationship(
  undefined,
  {
    namespace: 'Tenant',
    object: tenant.data.tenant.id,
    relation: 'members',
    subjectId: 'user_456'
  }
);
```

#### File Storage

```typescript
// Upload file with metadata
const result = await omnibase.storage.bucket('tenant-files').upload(
  'documents/report.pdf',
  fileData,
  {
    metadata: {
      department: 'engineering',
      project: 'Q4-review'
    }
  }
);

// Upload file to S3 is handled automatically by the SDK

// Download file
const { download_url } = await omnibase.storage.bucket('tenant-files')
  .download('tenant-123/documents/report.pdf');

const response = await fetch(download_url);
const blob = await response.blob();

// Delete file
await omnibase.storage.bucket('tenant-files')
  .delete('tenant-123/documents/report.pdf');
```

## Advanced Stripe Features

### Version Control

```bash
# Deploy new version
omnibase stripe push --version 2.0.0

# Rollback to previous version
omnibase stripe rollback --version 1.0.0

# List all versions
omnibase stripe versions
```

### User Migration & A/B Testing

These advanced Stripe features are planned for future releases. Current functionality includes:
- Version-controlled billing configurations in PostgreSQL
- Safe deployment and rollback via CLI
- Complete audit trail of all billing changes

Planned features:
- Automated user migration between pricing versions
- Staged rollout and A/B testing capabilities
- Advanced segmentation and targeting


## Project Structure

```
your-project/
├── omnibase/
│   ├── .omnibase-config          # CLI configuration
│   ├── stripe.config.json        # Billing configuration
│   ├── tsconfig.json             # TypeScript config
│   ├── permissions/              # Permission definitions
│   │   └── tenants.ts
│   ├── email/                    # Email templates
│   │   └── tenant-user-invite.html
│   ├── edge/                     # Edge functions
│   │   └── src/index.ts
│   └── environments/             # Environment configs
│       ├── .env.dev
│       ├── .env.staging
│       └── .env.prod
└── docker-compose.yml            # Generated compose file
```

## Architecture

### Core Services

- **Go + Gin API**: High-performance REST API layer
- **PostgreSQL**: Primary data store with versioning and RLS
- **Ory Kratos**: Identity and authentication management
- **Ory Keto**: Relationship-based permissions
- **Redis**: Caching and session management (in progress)
- **Cloudflare Workers**: Global edge function deployment
- **Cloud Run**: Serverless container hosting (in progress)

### Deployment Options

#### Self-hosted
```bash
# Complete stack via docker-compose
omnibase start

# All services containerized and networked
# Includes PostgreSQL, Kratos, Keto, Redis, API
```

#### Managed Cloud
```bash
# Deploy to cloud infrastructure
omnibase deploy --cloud

# Uses:
# - Cloud Run for API and containers
# - Neon for PostgreSQL
# - Cloudflare Workers for edge functions
# - Managed Redis
```

## Documentation

Detailed documentation is available for each module:

- **Core SDK**: [`sdk/core-js/README.md`](./sdk/core-js/README.md) (coming soon)
- **CLI Tool**: [`packages/cli/README.md`](./packages/cli/README.md) (coming soon)
- **API Reference**: [Full API documentation](./apps/docs) (in progress)
- **Stripe Config**: [`FREE_PRICING_BEHAVIOR.md`](./FREE_PRICING_BEHAVIOR.md)

## Roadmap to Beta

- [x] Multi-tenant authentication system
- [x] Stripe configuration versioning
- [x] Edge function deployment
- [x] Row-level security helpers
- [x] Permission management
- [x] File storage system
- [ ] Tenant user invitation flow (90% complete)
- [ ] Redis service integration (in progress)
- [ ] Email service (in progress)
- [ ] Docker container hosting (in progress)
- [ ] Comprehensive test coverage (in progress)
- [ ] Production deployment guides
- [ ] SDK documentation
- [ ] Migration guides

## Examples

Check out complete example applications:

- **Next.js App**: [`tests/test-apps/nextjs`](./tests/test-apps/nextjs) - Full-featured app with auth, tenants, payments, and storage
- **React App**: [`tests/test-apps/react`](./tests/test-apps/react) (coming soon)

## Requirements

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ or Bun 1.0+
- **PostgreSQL**: 14+ (provided via Docker)
- **Stripe Account**: For payment features

## Environment Support

| Environment | Status | Notes |
|------------|--------|-------|
| ✅ Node.js 18+ | Supported | LTS versions recommended |
| ✅ Bun 1.0+ | Supported | Faster alternative to Node |
| ✅ TypeScript 5+ | Recommended | Full type safety |
| ✅ Next.js 14+ | Supported | App Router and Pages Router |
| ✅ React 18+ | Supported | Client and Server Components |
| 🚧 Vue.js | Planned | Coming in future release |
| 🚧 Svelte | Planned | Coming in future release |

## Security Features

| Feature | Description |
|---------|-------------|
| **Row-Level Security** | PostgreSQL RLS policies with tenant isolation helpers |
| **Encrypted Storage** | All sensitive data encrypted at rest |
| **Session Management** | Secure session handling via Ory Kratos |
| **OAuth Support** | Google, GitHub, Microsoft, Apple integrations |
| **Audit Logging** | Complete audit trail for billing and user actions |
| **RBAC Permissions** | Fine-grained access control via Ory Keto |

## Contributing

OmniBase is currently in alpha and not yet accepting external contributions. Once we reach beta, we'll open up contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/omni-base/issues)
- **Documentation**: [Full documentation](./apps/docs) (in progress)

---

**Note**: OmniBase is under active development. APIs and features may change before the stable release. Always check the latest documentation before upgrading.