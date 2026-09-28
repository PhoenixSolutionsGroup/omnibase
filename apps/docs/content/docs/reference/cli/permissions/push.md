---
title: "Push"
---

## Summary

Deploy namespace files to the API

## Usage

```bash
omnibase permissions push
```

## Description

Deploy the permission namespace files in `omnibase/permissions/` to the selected environment's API.

All `*.ts` namespace files (except `types.ts`) are merged into a single bundle — imports and `export class` prefixes are stripped — and uploaded alongside `roles.config.json` if present. The API deploys the namespaces and syncs any system roles.

After a successful deploy the permissions services are restarted: locally via `docker compose restart permissions`, or in managed mode via the managed-hosting restart endpoints.

Before: `omnibase/permissions/` must exist with at least one namespace file, and a running API is required.

```bash
omnibase permissions push
omnibase permissions push --env dev
```
