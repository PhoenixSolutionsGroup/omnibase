---
title: "Add"
---

## Summary

Add a custom domain

## Usage

```bash
omnibase cloud domains add
```

## Description

Add an account-level custom domain, for example `example.com` or `*.example.com`.

The response includes the CNAME target and, when required, a TXT DCV record. Add these at your DNS provider, then poll with `omnibase cloud domains status <id>` until the domain is active.

Before: a profile and a provisioned branch must be configured.

```bash
omnibase cloud domains add example.com --env dev
omnibase cloud domains add '*.example.com' --env dev
```

## Arguments

- `domain (required)`
