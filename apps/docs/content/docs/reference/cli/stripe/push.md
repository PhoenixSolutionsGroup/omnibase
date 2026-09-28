---
title: "Push"
---

## Summary

Push the local Stripe config to Stripe

## Usage

```bash
omnibase stripe push
```

## Description

Load the merged config from `omnibase/stripe/` and apply it to Stripe through the API, creating, updating, and archiving resources as needed.

`${VAR}` references in webhook URLs are expanded from the local env before upload. The response reports every created/updated/archived product, price, meter, coupon, promotion code, and webhook. When new webhooks are created their signing secrets are printed — save them.

Before: `omnibase/stripe/` must contain at least one `*.config.json` and the Stripe env (e.g. `STRIPE_SECRET_KEY`) must be configured for the environment.

```bash
omnibase stripe push
omnibase stripe push --env dev
```

## Options

- **`--env <environment>`**
  Override environment for this command
