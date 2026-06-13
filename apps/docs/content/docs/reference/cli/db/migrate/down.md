---
title: "Down"
---

## Summary

Roll back one or more applied migrations

## Usage

```bash
omnibase db migrate down
```

## Description

Roll back the most recent migration(s) by applying their down.sql files in reverse order.

Use this to undo recently applied migrations during development. You can specify the number of steps or a target migration name.

Before: ensure the API is running and the environment is configured.
After: the specified migrations are rolled back from the database.

## Options

- **`-d, --dir <directory>`** (default: `omnibase/db`)
  Migrations directory
- **`-n, --name <name>`**
  Specific migration dir name to rollback to (non-interactive)
- **`--steps <number>`**
  Number of steps to rollback (non-interactive, overrides --name)
