---
title: "Status"
---

## Summary

Poll domain status until active

## Usage

```bash
omnibase cloud domains status
```

## Description

Poll the status of a custom domain until it activates or the timeout elapses (default 120s).

While DNS and certificate issuance are pending it prints the records still needed; it exits successfully as soon as the domain is live.

Before: the domain must exist (see `omnibase cloud domains add`).

```bash
omnibase cloud domains status dom_123 --env dev
omnibase cloud domains status dom_123 --timeout 300 --env dev
```

## Arguments

- `domain-id (required)`

## Options

- **`--timeout <seconds>`** (default: `120`)
  Poll timeout in seconds
