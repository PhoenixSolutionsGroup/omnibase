---
title: "Reset"
---

## Summary

Archive all Stripe resources and clear local config

## Usage

```bash
omnibase stripe reset
```

## Description

Archive every Stripe resource for the environment and clear the local config.

This is destructive and cannot be undone — it requires a confirmation prompt unless `-y, --yes` is passed. The API reports what was archived and any errors.

```bash
omnibase stripe reset
omnibase stripe reset -y
omnibase stripe reset --env dev -y
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`-y, --yes`**
  Skip confirmation prompt
