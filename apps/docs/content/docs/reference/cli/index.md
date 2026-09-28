---
title: "CLI Reference"
---

# OmniBase CLI

OmniBase CLI - Manage Docker Compose services and environment configuration

## Usage

```
omnibase [command] [options]
```

## Global Options

- **`-V, --version`** — output the version number
- **`--env <environment>`** — Override environment for this command
- **`--mode <mode>`** — Docker compose mode: 'dev', 'test', 'perf-test', or 'default' (default: default)

## Commands

- [`init`](/reference/cli/init) — Initialize a new omnibase project
- [`start`](/reference/cli/start) — Start services and deployment dev servers
- [`stop`](/reference/cli/stop) — Stop the Docker Compose services
- [`env`](/reference/cli/env) — List available environments
- [`permissions`](/reference/cli/permissions) — Manage Ory Keto permissions
- [`auth`](/reference/cli/auth) — Manage the authentication service
- [`stripe`](/reference/cli/stripe) — Manage Stripe configuration
- [`email`](/reference/cli/email) — Manage email templates
- [`db`](/reference/cli/db) — Database management commands
- [`cloud`](/reference/cli/cloud) — Manage OmniBase Cloud
- [`sync`](/reference/cli/sync) — Sync local configuration to a remote environment
- [`restart`](/reference/cli/restart) — Restart one or more services
