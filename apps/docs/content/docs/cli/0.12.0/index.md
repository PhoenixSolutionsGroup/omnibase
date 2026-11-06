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

- [`init`](/cli/0.12.0/init) — Initialize a new omnibase project
- [`start`](/cli/0.12.0/start) — Start services and deployment dev servers
- [`stop`](/cli/0.12.0/stop) — Stop the Docker Compose services
- [`env`](/cli/0.12.0/env) — List available environments
- [`permissions`](/cli/0.12.0/permissions) — Manage Ory Keto permissions
- [`auth`](/cli/0.12.0/auth) — Manage the authentication service
- [`stripe`](/cli/0.12.0/stripe) — Manage Stripe configuration
- [`email`](/cli/0.12.0/email) — Manage email templates
- [`db`](/cli/0.12.0/db) — Database management commands
- [`cloud`](/cli/0.12.0/cloud) — Manage OmniBase Cloud
- [`sync`](/cli/0.12.0/sync) — Sync local configuration to a remote environment
- [`restart`](/cli/0.12.0/restart) — Restart one or more services
- [`docs`](/cli/0.12.0/docs) — Search and read the Omnibase documentation
