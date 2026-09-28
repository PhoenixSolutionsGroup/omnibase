---
title: "Workers"
---

## Summary

Manage Cloudflare Workers deployments

## Usage

```bash
omnibase cloud workers
```

## Description

Deploy and inspect the Workers deployments defined in omnibase.toml or `omnibase/workers/`.

Each deployment maps to a directory (default `omnibase/workers/`) containing a `wrangler.toml`, `wrangler.jsonc`, or `wrangler.json`. `deploy` ships a deployment to the managed hosting cloud; `list` shows what is currently deployed for a branch.

## Subcommands

- [`deploy`](/reference/cli/cloud/workers/deploy) — Deploy workers to Cloudflare via managed hosting
- [`list`](/reference/cli/cloud/workers/list) — List deployed workers for a branch
