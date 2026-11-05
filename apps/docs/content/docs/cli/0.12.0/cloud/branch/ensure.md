---
title: "Ensure"
---

## Summary

Provision a branch if it does not exist and wait for it

## Usage

```bash
omnibase cloud branch ensure
```

## Description

Idempotently provision a branch and wait until it is active and its API reports ready.

An existing live branch with the same name is reused, so this is safe to run on every CI job. When no branch exists, `--region`, `--tier`, and `--email` are required.

With `--json`, prints a single JSON object instead of log output. Use `--no-wait` to return as soon as provisioning starts.

```bash
omnibase cloud branch ensure pr-123 --region syd --tier shared_starter --email ci@example.com
omnibase cloud branch ensure pr-123 --region syd --tier shared_starter --email ci@example.com --json
```

## Arguments

- `branch (required)`

## Options

- **`--project-id <id>`**
  Project ID
- **`--region <region>`**
  Region (e.g. syd)
- **`--tier <tier>`**
  Deployment tier (e.g. shared_starter)
- **`--email <email>`**
  Billing email
- **`--no-wait`**
  Return immediately after provisioning starts
- **`--timeout <seconds>`** (default: `1800`)
  Provisioning timeout in seconds
- **`--health-timeout <seconds>`** (default: `600`)
  Health check timeout in seconds
- **`--json`**
  Print the resolved branch as JSON
