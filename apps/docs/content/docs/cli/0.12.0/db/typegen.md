---
title: "Typegen"
---

## Summary

Generate types from the database schema

## Usage

```bash
omnibase db typegen
```

## Description

Generate a typed client from the database schema for one of `typescript`, `go`, or `swift`.

The target language is chosen with `-l, --language` or an interactive prompt. `-s, --schema` selects the comma-separated schemas to include (default `public`).

Output is written to `omnibase/db/types/` — `omnibase.ts` for TypeScript, `omnibase.go` for Go, and `Omnibase.swift` for Swift.

Before: the database must be running and reachable locally.

```bash
omnibase db typegen
omnibase db typegen --language typescript
omnibase db typegen -l go --schema public,analytics
```

## Options

- **`-s, --schema <schemas>`** (default: `public`)
  Comma-separated list of schemas to include
- **`-l, --language <language>`**
  Target language: typescript, go, swift
