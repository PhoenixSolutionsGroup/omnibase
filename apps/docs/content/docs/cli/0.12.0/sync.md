---
title: "Sync"
---

## Summary

Sync local configuration to a remote environment

## Usage

```bash
omnibase sync
```

## Description

Push local project configuration to the selected environment.

Available services: `permissions` (Ory Keto namespaces), `db` (SQL migration files), `email` (HTML templates), `stripe` (product/price config), and `env` (environment config, cloud only).

With no arguments an interactive multi-select shows the available services (all pre-checked). Pass service names directly, or `all` to sync every service available for the environment. Cloud-only services are filtered out for the local environment.

After: a per-service summary reports what synced and what failed.

```bash
omnibase sync
omnibase sync all
omnibase sync permissions db
omnibase sync permissions --env dev
```

## Arguments

- `services`
