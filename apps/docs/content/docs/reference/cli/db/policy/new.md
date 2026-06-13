---
title: "New"
---

## Summary

Create a new RLS policy file for a database table

## Usage

```bash
omnibase db policy new
```

## Description

Create a new RLS policy file for a database table.

If `--table` is provided, creates a scaffold policy file for that table verbatim (no validation).

If `--table` is omitted, shows an interactive search prompt listing tables from the Prisma schema that don't already have a policy file.

Before: ensure the Prisma schema exists (run `omnibase init` first).
After: edit the generated policy file to define the RLS rules.

## Options

- **`-t, --table <table>`**
  Table name (creates scaffold verbatim, skips interactive prompt)
- **`-d, --policies-dir <directory>`** (default: `omnibase/db/policies`)
  Policies directory
