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

- [`migrate`](/cli/0.12.0/db/migrate) — Database migration management
- [`policy`](/cli/0.12.0/db/policy) — Database policy management
- [`typegen`](/cli/0.12.0/db/typegen) — Generate types from the database schema
