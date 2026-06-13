---
title: "Typegen"
---

## Summary

Generate Prisma client for definePolicy types

## Usage

```bash
omnibase db policy typegen
```

## Description

Generate the Prisma client used by policy files for type-safe `definePolicy<Prisma.XWhereInput>(...)` calls.

Run this after modifying the Prisma schema so the generated types stay in sync.

Before: ensure omnibase/db/schema.prisma exists.
After: types are available at omnibase/db/policies/generated/.
