---
title: "Policy"
---

## Summary

Database policy management

## Usage

```bash
omnibase db policy
```

## Description

Create and manage RLS policy files for database tables.

Policy files define row-level security rules for each table. Use `new` to scaffold a new policy, or `typegen` to regenerate the Prisma client.

## Subcommands

- [`typegen`](/reference/cli/db/policy/typegen) — Generate Prisma client for definePolicy types
- [`new`](/reference/cli/db/policy/new) — Create a new RLS policy file for a database table
