---
title: "Stripe"
---

## Summary

Manage Stripe configuration

## Usage

```bash
omnibase stripe
```

## Description

Manage Stripe products, prices, meters, coupons, promotion codes, and webhooks through the `*.config.json` files in `omnibase/stripe/`.

`push` and `validate` send the merged local config to the API, `get` and `pull` read it back, `history` shows past config versions, and `webhook secret` retrieves signing secrets. `reset` archives all resources.

## Subcommands

- [`validate`](/cli/0.12.0/stripe/validate) — Validate the local Stripe config against the API
- [`status`](/cli/0.12.0/stripe/status) — Report pending changes, drift, and untracked Stripe objects
- [`push`](/cli/0.12.0/stripe/push) — Push the local Stripe config to Stripe
- [`get`](/cli/0.12.0/stripe/get) — Get the current Stripe configuration
- [`history`](/cli/0.12.0/stripe/history) — Get the Stripe configuration history
- [`pull`](/cli/0.12.0/stripe/pull) — Pull the current Stripe configuration from Stripe
- [`webhook`](/cli/0.12.0/stripe/webhook) — Manage Stripe webhook configuration
- [`reset`](/cli/0.12.0/stripe/reset) — Archive managed Stripe resources and clear local config
