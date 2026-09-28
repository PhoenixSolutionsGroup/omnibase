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

- [`validate`](/reference/cli/stripe/validate) — Validate the local Stripe config against the API
- [`push`](/reference/cli/stripe/push) — Push the local Stripe config to Stripe
- [`get`](/reference/cli/stripe/get) — Get the current Stripe configuration
- [`history`](/reference/cli/stripe/history) — Get the Stripe configuration history
- [`pull`](/reference/cli/stripe/pull) — Pull the current Stripe configuration from Stripe
- [`webhook`](/reference/cli/stripe/webhook) — Manage Stripe webhook configuration
- [`reset`](/reference/cli/stripe/reset) — Archive all Stripe resources and clear local config
