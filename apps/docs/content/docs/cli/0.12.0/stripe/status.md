---
title: "Status"
---

## Summary

Report pending changes, drift, and untracked Stripe objects

## Usage

```bash
omnibase stripe status
```

## Description

Compare the local `*.config.json` files, the last applied config, and live Stripe objects.

`pending` means the local config differs from the last applied config. `drift` means live Stripe objects were changed outside `omnibase stripe push`. `untracked` means managed Stripe objects are neither in the local nor applied config.

`--fail-on-drift` exits 1 when drift or untracked objects exist. Pending local changes alone do not fail.

```bash
omnibase stripe status
omnibase stripe status --json
omnibase stripe status --fail-on-drift
```

## Options

- **`--env <environment>`**
  Override environment for this command
- **`--json`**
  Print the raw status response as JSON
- **`--fail-on-drift`**
  Exit with code 1 when drift or untracked objects exist
