---
title: "Init"
---

## Summary

Initialize a new omnibase project

## Usage

```bash
omnibase init
```

## Description

Scaffold an `omnibase/` directory with the project template files.

Creates `omnibase/omnibase.toml`, `omnibase/.env.local`, a Stripe config, and the default `omnibase/db/` layout. If an `omnibase/` directory already exists the command exits without changing anything.

```bash
omnibase init
```

After: edit `omnibase/omnibase.toml`, add secrets to `omnibase/.env.local`, then run `omnibase start`.
