---
title: "Pull"
---

## Summary

Pull the current Stripe configuration from Stripe

## Usage

```bash
omnibase stripe pull
```

## Description

Pull the live Stripe configuration through the API and write it to a file so it can be reviewed and committed.

The file is written to `--output <file>` if given, otherwise to `omnibase/stripe/pulled.config.json`, or `stripe.config.json` in the current directory if no `omnibase/stripe/` directory exists.

```bash
omnibase stripe pull
omnibase stripe pull --env dev
omnibase stripe pull --output omnibase/stripe/config.json
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`--output <file>`**
  Save output to file (default: stripe.config.json)
