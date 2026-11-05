---
title: "Login"
---

## Summary

Authenticate with an API key and save a profile

## Usage

```bash
omnibase cloud login
```

## Description

Verify an API key against the managed hosting API and save it as a local profile.

The profile is named after the tenant and key (or `--name`) and is set as active, so subsequent cloud commands use it automatically. Authentication is stored in the CLI credentials file, not in the project.

Before: obtain an API key from the OmniBase dashboard.
After: a profile is saved and active. Verify with `omnibase cloud profiles`.

```bash
omnibase cloud login sk_live_abc123
omnibase cloud login sk_live_abc123 --name staging
omnibase cloud login sk_live_abc123 --url https://api.omnibase.io
```

## Arguments

- `api_key (required)`
  API Key

## Options

- **`--url <url>`**
  Managed hosting URL
- **`--name <name>`**
  Profile name
