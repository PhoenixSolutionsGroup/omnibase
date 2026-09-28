---
title: "Get"
---

## Summary

Get the current Stripe configuration

## Usage

```bash
omnibase stripe get
```

## Description

Fetch the Stripe configuration currently stored in the API and print it (or save it with `--output <file>`).

```bash
omnibase stripe get
omnibase stripe get --env dev
omnibase stripe get --output stripe-current.json
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`--output <file>`**
  Save output to file
