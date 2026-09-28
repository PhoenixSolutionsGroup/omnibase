---
title: "History"
---

## Summary

Get the Stripe configuration history

## Usage

```bash
omnibase stripe history
```

## Description

Fetch past Stripe configuration versions with pagination, showing the ID, version, and timestamps of each.

Use `--limit` and `--offset` to page through results, or `--output <file>` to save the raw response.

```bash
omnibase stripe history
omnibase stripe history --limit 25
omnibase stripe history --limit 10 --offset 10
omnibase stripe history --output history.json
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`--limit <number>`** (default: `10`)
  Number of records to fetch (default: 10)
- **`--offset <number>`** (default: `0`)
  Number of records to skip (default: 0)
- **`--output <file>`**
  Save output to file
