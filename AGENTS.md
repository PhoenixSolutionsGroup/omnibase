# OmniBase — Public Monorepo

This repository contains the open-source OmniBase platform: the REST API, CLI, SDKs, dashboard, and documentation.

## What OmniBase offers

- **Auth** — sessions, identities, OIDC login, API keys, and tenant switching.
- **Multi-tenancy** — tenants, invitations, and tenant isolation.
- **Permissions** — role-based access control with relationship-based policies.
- **Database** — Postgres with a Prisma schema, SQL migrations, RLS, and type generation.
- **Storage** — S3-compatible uploads, downloads, and public objects. Paths are bucket-wide; prefix them with the tenant ID.
- **Payments** — Stripe checkout, invoices, subscriptions, metered usage, and customer portal.
- **Email** — templates and send APIs.
- **Workers** — Bun edge functions, cron jobs, and queues. The deployment `path` in `omnibase.toml` points at the worker directory, which can be the whole application.
- **Managed hosting** — branches, domains, environment variables, and deploys through `omnibase cloud`.
- **SDKs** — `@omnibase/core-js`, `@omnibase/nextjs`, `@omnibase/react`, `@omnibase/shadcn`, and `@omnibase/mcp-server`.

## Documentation

Do not guess OmniBase APIs or configuration. Query the current docs with the CLI:

```bash
omnibase docs list                        # latest docs pages
omnibase docs search "storage upload"     # ranked results with snippets
omnibase docs get guides/storage          # full markdown page
omnibase docs get /api/latest/storage/uploadFile
omnibase docs search "tenant jwt" --json  # agent-friendly output
```

Results are cached for one hour; add `--refresh` to bypass the cache. Set `OMNIBASE_DOCS_URL` to use a different docs deployment.
