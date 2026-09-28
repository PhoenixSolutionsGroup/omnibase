---
title: "Switch"
---

## Summary

Change the active profile

## Usage

```bash
omnibase cloud switch
```

## Description

Set which saved profile subsequent cloud commands use.

With a `[profile]` argument the profile is switched directly. Without one, an interactive select shows all saved profiles with the current one marked.

Before: at least one profile must exist (see `omnibase cloud login`).
After: cloud commands resolve credentials from the active profile.

```bash
omnibase cloud switch
omnibase cloud switch acme-prod
```

## Arguments

- `profile`
