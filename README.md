# OmniBase

**Open-source Backend-as-a-Service with native multi-tenancy**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Status: Alpha](https://img.shields.io/badge/Status-Alpha-yellow)]()

---

## Why OmniBase?

- **Multi-tenancy built-in** — Tenant isolation, RBAC, and invitations out of the box. Works for single-tenant apps too.
- **Stripe as Code** — Version-controlled billing configs with rollback, audit trails, and free tier support ($0 pricing).
- **Row-Level Security** — PostgreSQL RLS with helpers like `auth.active_tenant_id()` for automatic data isolation.
- **Self-host or managed** — Full Docker Compose stack, or deploy to [omnibase.tech](https://omnibase.tech) in minutes.
- **Pay-as-you-go ready** — Built-in metered billing and usage tracking for consumption-based pricing.

---

## Dashboard Preview

<!-- Add your dashboard screenshot here -->
![OmniBase Dashboard](https://via.placeholder.com/800x450?text=Dashboard+Screenshot)

---

## Get Started

### Managed Hosting (Fastest)

Sign up at **[omnibase.tech](https://omnibase.tech)** — no infrastructure to manage.

### Self-Host

```bash
# Install CLI
npm i -g @omnibase/cli

# Initialize and start
omnibase init
omnibase start

# API runs at http://localhost:8080
```

Quick start guide at https://docs.omnibase.tech/docs/guides/quickstart

---

## Quick Example

SDKs available in multiple languages (currently **JavaScript/TypeScript** and **Go**).

```typescript
import { Configuration, V1TenantsApi, V1PaymentsApi } from '@omnibase/core-js';

const config = new Configuration({ basePath: 'http://localhost:8080' });

// Switch tenant context
const tenants = new V1TenantsApi(config);
await tenants.switchActiveTenant({ switchTenantRequest: { tenantId: 'tenant_123' } });

// Create a checkout session
const payments = new V1PaymentsApi(config);
const { data } = await payments.createCheckout({
  createCheckoutRequest: {
    priceId: 'pro_monthly',
    successUrl: 'https://yourapp.com/success',
  },
});
```

---

## Links

| Resource | Link |
|----------|------|
| Documentation | [docs.omnibase.tech](https://docs.omnibase.tech) |
| Quickstart Guide | [Getting Started](https://docs.omnibase.tech/guides/quickstart) |

---

## Before Beta

Features still being implemented:

| Feature | Progress |
|---------|----------|
| Emailing Service | 0% |
| Managed-Hosting Platform | 50% |

---

## License

[Apache 2.0](LICENSE)
