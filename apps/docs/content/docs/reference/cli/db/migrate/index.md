---
title: "Migrate"
---

## Summary

Database migration management

## Usage

```bash
omnibase db migrate
```

## Description

Create, apply, and roll back database migrations.

Use `new` to scaffold a blank migration file, `generate` to produce migration SQL from your Prisma schema and RLS policies, `push` to apply pending migrations to the database, `reset` to drop and re-apply everything, and `down` to roll back applied migrations.

## Subcommands

- [`new`](/reference/cli/db/migrate/new) — Create a new database migration
- [`push`](/reference/cli/db/migrate/push) — Apply pending migrations to the database
- [`reset`](/reference/cli/db/migrate/reset) — Drop all tables and re-apply all migrations (destructive)
- [`generate`](/reference/cli/db/migrate/generate) — Generate migration files from Prisma schema + RLS policies
- [`down`](/reference/cli/db/migrate/down) — Roll back one or more applied migrations
