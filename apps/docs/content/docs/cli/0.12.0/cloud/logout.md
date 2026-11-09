---
title: "Logout"
---

## Summary

Remove saved authentication profiles

## Usage

```bash
omnibase cloud logout
```

## Description

Remove one, several, or all saved profiles.

With a `[profile]` argument only that profile is removed. Without one, an interactive multi-select prompt shows all profiles. `--all` removes every profile and clears the active profile.

If the active profile is removed, the first remaining profile becomes active (or none if the list is empty).

```bash
omnibase cloud logout
omnibase cloud logout staging
omnibase cloud logout --all
```

## Arguments

- `profile`

## Options

- **`--all`**
  Remove all profiles
