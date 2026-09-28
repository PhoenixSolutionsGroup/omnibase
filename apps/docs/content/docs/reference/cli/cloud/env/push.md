---
title: "Push"
---

## Summary

Push omnibase.toml config to managed hosting

## Usage

```bash
omnibase cloud env push
```

## Description

Push the cloud-relevant sections of omnibase.toml to the selected branch, interpolating `{VAR}` references first.

Everything except `[local]`, `project_id`, and `deployments` is sent; managed hosting applies what it understands and reports the rest. `[local]` stays on this machine — that is where Stripe lives, since managed hosting owns Stripe env via the Connect account it provisions per branch. `[versions]` keys are validated before push.

Before: `project_id` must be set in omnibase.toml, a profile must be configured, and the branch must be provisioned. Pushing to `local` is not supported.

After: the branch reports which sections were applied and which were ignored. Unresolved `{VAR}` values are warned about and left literal.

See the env resolution model on the [`cloud env`](/reference/cli/cloud/env) page.

```bash
omnibase cloud env push --env dev
omnibase cloud env push --env staging
```
