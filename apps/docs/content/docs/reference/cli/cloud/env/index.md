---
title: "Env"
---

## Summary

Manage environment configuration

## Usage

```bash
omnibase cloud env
```

## Description

Push configuration to a cloud branch and resolve per-environment variables.

**Environment variable injection**

Several commands resolve `{VAR}` references in your configuration (e.g. `website_url = "{NEXT_PUBLIC_WEBSITE_URL}"`) from a two-layer model:

- **omnibase/omnibase.toml** (committed) — the structure, with `{VAR}` references for per-environment values.
- **omnibase/.env.<branch>** (gitignored) — flat `KEY=VALUE`, one file per branch/environment (`.env.local` for local dev).

Resolution order, per key, first non-empty wins:
`process.env` → `omnibase/.env.<branch>` (from `--env` or the interactive picker) → the literal `{VAR}` left in place.

This drives `cloud workers deploy` (wrangler build env + packaged `[vars]`), `cloud env push` (interpolation of the cloud config sections), and `omnibase start` (control-plane env + dev-server spawns).

Caveats: unresolved `{VAR}` values are left literal and the CLI warns; secrets belong in the managed-hosting secrets API or `wrangler secret`, never in `[vars]` (vars are visible in the deployed worker).

## Subcommands

- [`push`](/reference/cli/cloud/env/push) — Push omnibase.toml config to managed hosting
