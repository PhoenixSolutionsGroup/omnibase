---
title: "Env"
---

## Summary

List available environments

## Usage

```bash
omnibase env
```

## Description

List the environments available to this project.

Local environments come from `omnibase/.env.local`; cloud environments come from the branches of the project connected to OmniBase Cloud. If no environments exist, the command hints at how to set them up.

Before: a profile must be configured and `project_id` set in omnibase.toml to show cloud branches.

```bash
omnibase env
```
