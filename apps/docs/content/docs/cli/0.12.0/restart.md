---
title: "Restart"
---

## Summary

Restart one or more services

## Usage

```bash
omnibase restart
```

## Description

Restart services, either named explicitly, all of them with `--all`, or via an interactive multi-select when nothing is given.

Available services: `api`, `auth`, `permissions`, `postgrest`, and the local-only `postgres`, `mailpit`, and `rustfs`.

Locally, services restart via Docker Compose. For a cloud environment the managed-hosting API restarts the matching cloud services; local-only services are skipped.

```bash
omnibase restart
omnibase restart api auth
omnibase restart --all
omnibase restart api --env dev
```

## Arguments

- `services`

## Options

- **`--all`**
  Restart all services
