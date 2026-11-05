---
title: "Validate"
---

## Summary

Validate namespace TypeScript syntax

## Usage

```bash
omnibase permissions validate
```

## Description

Type-check every namespace file in `omnibase/permissions/` locally by running `bun build --no-bundle --target=node` on each.

No changes are sent to the API. Exits non-zero if any file has syntax errors. Use this before `push`.

```bash
omnibase permissions validate
```
