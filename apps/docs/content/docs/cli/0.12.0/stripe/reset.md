---
title: "Reset"
---

## Summary

Archive managed Stripe resources and clear local config

## Usage

```bash
omnibase stripe reset
```

## Description

Archive Omnibase-managed Stripe resources for the environment and clear the local config. Objects without `metadata.omnibase_managed=true` are left untouched unless `--all` is passed.

This is destructive and cannot be undone — it requires a confirmation prompt unless `-y, --yes` is passed. The API reports what was archived and any errors.

```bash
omnibase stripe reset
omnibase stripe reset -y
omnibase stripe reset --all -y
omnibase stripe reset --env dev -y
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`--all`**
  Also archive Stripe objects not managed by Omnibase
- **`-y, --yes`**
  Skip confirmation prompt
