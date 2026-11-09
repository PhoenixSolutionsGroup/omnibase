---
title: "Get"
---

## Summary

Print a documentation page

## Usage

```bash
omnibase docs get
```

## Description

Print one documentation page as Markdown. The path can be a docs URL or a relative path such as `guides/storage`.

```bash
omnibase docs get guides/storage
omnibase docs get /api/latest/storage/uploadFile --json
```

## Arguments

- `path (required)`
  Page path or URL

## Options

- **`--json`**
  Output JSON
- **`--refresh`**
  Ignore the local cache
