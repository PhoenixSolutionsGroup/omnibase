---
title: "CLI Reference"
---

# Omnibase CLI

Omnibase CLI - Manage Docker Compose services and environment configuration

## Usage

```
omnibase [command] [options]
```

## Global Options

- **`-V, --version`** — output the version number
- **`--env <environment>`** — Override environment for this command
- **`--mode <mode>`** — Docker compose mode: 'dev', 'test', 'perf-test', or 'default' (default: default)

## Commands

- [`init`](/reference/cli/init) — Initialize a new omnibase project with template files
- [`start`](/reference/cli/start) — Start the Docker Compose services
- [`stop`](/reference/cli/stop) — Stop the Docker Compose services
- [`env`](/reference/cli/env) — List available environments
- [`permissions`](/reference/cli/permissions) — Manage Ory Keto permissions
- [`auth`](/reference/cli/auth) — Manage authentication service
- [`stripe`](/reference/cli/stripe) — Manage Stripe configuration
- [`email`](/reference/cli/email) — Manage email templates
- [`db`](/reference/cli/db) — Database management commands
- [`cloud`](/reference/cli/cloud) — Manage Omnibase Cloud (authentication and deployments)
- [`sync`](/reference/cli/sync) — Sync local configuration to remote environment
- [`restart`](/reference/cli/restart) — Restart services (interactive if none specified)
