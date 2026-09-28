---
title: "Db"
---

## Summary

Database management commands

## Usage

```bash
omnibase db
```

## Description

Manage the database: migrations, RLS policies, and generated types.

`migrate` creates, applies, and rolls back migrations; `policy` scaffolds row-level security policy files; `typegen` generates typed clients from the schema.

## Subcommands

- [`migrate`](/reference/cli/db/migrate) — Database migration management
- [`policy`](/reference/cli/db/policy) — Database policy management
- [`typegen`](/reference/cli/db/typegen) — Generate types from the database schema
