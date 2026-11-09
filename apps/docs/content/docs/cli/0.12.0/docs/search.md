---
title: "Search"
---

## Summary

Search documentation

## Usage

```bash
omnibase docs search
```

## Description

Search the latest documentation by keyword and return ranked pages with snippets.

```bash
omnibase docs search "storage upload"
omnibase docs search "tenant jwt" --limit 10 --json
```

## Arguments

- `query (required)`
  Search query

## Options

- **`--limit <number>`** (default: `5`)
  Maximum results
- **`--json`**
  Output JSON
- **`--refresh`**
  Ignore the local cache
