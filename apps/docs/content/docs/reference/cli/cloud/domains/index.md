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

- [`add`](/reference/cli/cloud/domains/add) — Add a custom domain
- [`list`](/reference/cli/cloud/domains/list) — List account-level custom domains
- [`rm`](/reference/cli/cloud/domains/rm) — Remove a custom domain
- [`status`](/reference/cli/cloud/domains/status) — Poll domain status until active
- [`attach`](/reference/cli/cloud/domains/attach) — Attach a validated domain to a worker
- [`detach`](/reference/cli/cloud/domains/detach) — Detach a domain from a worker
