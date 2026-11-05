---
title: "Permissions"
---

## Summary

Manage Ory Keto permissions

## Usage

```bash
omnibase permissions
```

## Description

Manage the Ory Keto permission namespaces and relationships.

`push` deploys the namespace files in `omnibase/permissions/` to the API, `validate` checks their TypeScript syntax locally, `check` asks whether a subject has a permission, and `set` grants one.

## Subcommands

- [`push`](/cli/0.12.0/permissions/push) — Deploy namespace files to the API
- [`validate`](/cli/0.12.0/permissions/validate) — Validate namespace TypeScript syntax
- [`check`](/cli/0.12.0/permissions/check) — Check if a subject has permission
- [`set`](/cli/0.12.0/permissions/set) — Grant a permission relation
