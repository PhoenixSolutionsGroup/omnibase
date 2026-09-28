---
title: "Validate"
---

## Summary

Validate the local Stripe config against the API

## Usage

```bash
omnibase stripe validate
```

## Description

Load and merge the `*.config.json` files under `omnibase/stripe/` and ask the API to validate them.

No resources are created or modified.

```bash
omnibase stripe validate
omnibase stripe validate --env dev
```

## Options

- **`--env <environment>`**
  Override environment for this command
