---
title: "Attach"
---

## Summary

Attach a validated domain to a worker

## Usage

```bash
omnibase cloud domains attach
```

## Description

Attach an activated account-level domain to a worker on the current branch.

`--worker` is required and names the deployment (matching the name in omnibase.toml or `omnibase/workers/`). For wildcard domains use `--hostname` to choose the concrete hostname to route.

Before: the domain must be active (see `omnibase cloud domains status`).

```bash
omnibase cloud domains attach dom_123 --worker api --env dev
omnibase cloud domains attach dom_123 --worker api --hostname www.example.com --env dev
```

## Arguments

- `domain-id (required)`

## Options

- **`--worker <name>`** (required)
  Worker deployment name
- **`--hostname <hostname>`**
  Concrete hostname to route (required for wildcard domains)
