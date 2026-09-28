---
title: "Cloud"
---

## Summary

Manage OmniBase Cloud

## Usage

```bash
omnibase cloud
```

## Description

Manage OmniBase Cloud — profile authentication, branch provisioning, Cloudflare Workers deployments, custom domains, and environment config.

Start with `login` to authenticate with an API key and create a profile, then `workers deploy` to ship deployments and `env push` to sync omnibase.toml config to a branch.

## Subcommands

- [`login`](/reference/cli/cloud/login) — Authenticate with an API key and save a profile
- [`logout`](/reference/cli/cloud/logout) — Remove saved authentication profiles
- [`switch`](/reference/cli/cloud/switch) — Change the active profile
- [`profiles`](/reference/cli/cloud/profiles) — List saved authentication profiles
- [`workers`](/reference/cli/cloud/workers) — Manage Cloudflare Workers deployments
- [`domains`](/reference/cli/cloud/domains) — Manage account-level custom domains
- [`branch`](/reference/cli/cloud/branch) — Manage project branches
- [`env`](/reference/cli/cloud/env) — Manage environment configuration
