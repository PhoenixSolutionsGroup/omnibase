---
title: "Domains"
---

## Summary

Manage account-level custom domains

## Usage

```bash
omnibase cloud domains
```

## Description

Add, validate, and attach custom domains (e.g. `example.com` or `*.example.com`) to workers.

Domains are account-level: add one, point your DNS records at it, wait for activation with `status`, then attach it to a worker with `attach`.

## Subcommands

- [`add`](/cli/0.12.0/cloud/domains/add) — Add a custom domain
- [`list`](/cli/0.12.0/cloud/domains/list) — List account-level custom domains
- [`rm`](/cli/0.12.0/cloud/domains/rm) — Remove a custom domain
- [`status`](/cli/0.12.0/cloud/domains/status) — Poll domain status until active
- [`attach`](/cli/0.12.0/cloud/domains/attach) — Attach a validated domain to a worker
- [`detach`](/cli/0.12.0/cloud/domains/detach) — Detach a domain from a worker
