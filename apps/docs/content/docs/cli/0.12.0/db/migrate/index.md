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

- [`new`](/cli/0.12.0/db/migrate/new) — Create a new database migration
- [`push`](/cli/0.12.0/db/migrate/push) — Apply pending migrations to the database
- [`reset`](/cli/0.12.0/db/migrate/reset) — Drop all tables and re-apply all migrations (destructive)
- [`generate`](/cli/0.12.0/db/migrate/generate) — Generate migration files from Prisma schema + RLS policies
- [`down`](/cli/0.12.0/db/migrate/down) — Roll back one or more applied migrations
