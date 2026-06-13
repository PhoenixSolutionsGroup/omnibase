---
title: "Reset"
---

## Summary

Drop all tables and re-apply all migrations (destructive)

## Usage

```bash
omnibase db migrate reset
```

## Description

Completely reset the database by dropping all tables and re-applying every migration from scratch.

Use this during local development when you want a clean database state. This is **destructive** — all data will be lost.

Before: ensure the database connection is configured and migrations exist.
After: the database is recreated with all migrations applied.

The command will prompt for confirmation unless `--yes` is provided.

## Options

- **`-d, --dir <directory>`** (default: `omnibase/db`)
  Directory containing migration files
- **`-y, --yes`**
  Skip confirmation prompt
