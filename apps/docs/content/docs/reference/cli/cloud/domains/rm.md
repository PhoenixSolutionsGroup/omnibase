---
title: "Rm"
---

## Summary

Remove a custom domain

## Usage

```bash
omnibase cloud domains rm
```

## Description

Remove a custom domain by ID and detach it from all workers.

Use `omnibase cloud domains list` to find the domain ID.

```bash
omnibase cloud domains list --env dev
omnibase cloud domains rm dom_123 --env dev
```

## Arguments

- `domain-id (required)`
