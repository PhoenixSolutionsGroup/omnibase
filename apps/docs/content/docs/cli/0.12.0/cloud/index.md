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

- [`login`](/cli/0.12.0/cloud/login) — Authenticate with an API key and save a profile
- [`logout`](/cli/0.12.0/cloud/logout) — Remove saved authentication profiles
- [`switch`](/cli/0.12.0/cloud/switch) — Change the active profile
- [`profiles`](/cli/0.12.0/cloud/profiles) — List saved authentication profiles
- [`workers`](/cli/0.12.0/cloud/workers) — Manage Cloudflare Workers deployments
- [`domains`](/cli/0.12.0/cloud/domains) — Manage account-level custom domains
- [`branch`](/cli/0.12.0/cloud/branch) — Manage project branches
- [`env`](/cli/0.12.0/cloud/env) — Manage environment configuration
