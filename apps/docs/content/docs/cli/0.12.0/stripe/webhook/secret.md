---
title: "Secret"
---

## Summary

Retrieve webhook signing secrets

## Usage

```bash
omnibase stripe webhook secret
```

## Description

List the configured webhooks and print each one's signing secret, ready to use as `STRIPE_WEBHOOK_SECRET`.

With a single webhook the secret is shown directly; with multiple, an interactive multi-select chooses which to display.

Before: webhooks must already be configured (e.g. by `stripe push`).

```bash
omnibase stripe webhook secret
omnibase stripe webhook secret --env dev
```

## Options

- **`--env <environment>`**
  Override environment for this command
