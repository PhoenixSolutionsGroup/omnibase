---
title: "Generate"
---

## Summary

Generate migration files from Prisma schema + RLS policies

## Usage

```bash
omnibase db migrate generate
```

## Description

Generate migration SQL by diffing the Prisma schema against the applied migration history, then appending RLS policy changes.

Use this as the primary way to create schema migrations. It uses a shadow database to replay the migration history and produce deterministic up/down diffs. RLS policies from `omnibase/db/policies/` are appended to the migration.

Before: ensure your Prisma schema is up to date and a PostgreSQL instance is available for the shadow database.
After: migration files are created in the migrations directory. Run `push` to apply them.

## Options

- **`--db-url <url>`**
  Database URL (defaults to postgresql://postgres:postgres@localhost:5432)
- **`-d, --dir <directory>`** (default: `omnibase/db`)
  Directory containing migration files
- **`-n, --name <name>`**
  Migration name
