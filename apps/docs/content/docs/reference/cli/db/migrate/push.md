---
title: "Push"
---

## Summary

Apply pending migrations to the database

## Usage

```bash
omnibase db migrate push
```

## Description

Apply any pending migration files to the connected database.

Run this after creating or generating migration files to apply them to your database. Uses the API endpoint for the selected environment.

Before: ensure migration files exist in the migrations directory.
After: the database schema is updated to match the applied migrations.

## Options

- **`-d, --dir <directory>`** (default: `omnibase/db`)
  Directory containing migration files
