---
title: "New"
---

## Summary

Create a new database migration

## Usage

```bash
omnibase db migrate new
```

## Description

Create a blank migration file with a timestamp prefix.

Use this when you need to write custom SQL that doesn't come from the Prisma schema diff — for example, data backfills, extensions, or manual DDL.

Before: ensure the migrations directory exists (or use `--dir`).
After: edit the generated file with your SQL statements.

## Options

- **`-d, --dir <directory>`** (default: `omnibase/db`)
  Directory to create migration file in
- **`-n, --name <name>`**
  Migration name (will prompt if not provided)
