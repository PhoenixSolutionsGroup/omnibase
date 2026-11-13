---
title: "Env"
---

## Summary

Export branch URLs and keys as environment variables

## Usage

```bash
omnibase cloud branch env
```

## Description

Resolve a branch's API URL, PostgREST URL, service key, and dashboard worker URL, then write them as dotenv content.

Use `--output` to write a gitignored `omnibase/.env.<branch>` file before `omnibase sync` or `omnibase cloud workers deploy`.

```bash
omnibase cloud branch env pr-123 --output omnibase/.env.pr-123
omnibase cloud branch env pr-123
```

## Arguments

- `branch (required)`

## Options

- **`--project-id <id>`**
  Project ID
- **`--worker-domain <domain>`** (default: `omnibase-workers.app`)
  Workers domain
- **`--cookie-domain <domain>`**
  Cookie domain
- **`--dashboard-url <url>`**
  Override the dashboard URL
- **`--output <path>`**
  Write dotenv output to a file
