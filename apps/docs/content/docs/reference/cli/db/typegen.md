---
title: "Typegen"
---

## Usage

```bash
omnibase db typegen
```

## Description

Generate types from database schema

## Options

- **`-o, --output <path>`**
  Output file path (default depends on language)
- **`-s, --schema <schemas>`** (default: `public`)
  Comma-separated list of schemas to include
- **`-l, --language <language>`**
  Target language: typescript, go, swift
