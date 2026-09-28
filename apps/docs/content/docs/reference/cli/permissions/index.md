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

- [`push`](/reference/cli/permissions/push) — Deploy namespace files to the API
- [`validate`](/reference/cli/permissions/validate) — Validate namespace TypeScript syntax
- [`check`](/reference/cli/permissions/check) — Check if a subject has permission
- [`set`](/reference/cli/permissions/set) — Grant a permission relation
