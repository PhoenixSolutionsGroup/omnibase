---
title: "Branch"
---

## Summary

Manage project branches

## Usage

```bash
omnibase cloud branch
```

## Description

Provision, list, and deprovision project branches.

Each branch is an isolated environment with its own database, API, permissions, and workers. Use `new` to provision one, then reference it with `--env <branch>` on other cloud commands.

## Subcommands

- [`new`](/reference/cli/cloud/branch/new) — Create a new project branch
- [`list`](/reference/cli/cloud/branch/list) — List project branches
- [`rm`](/reference/cli/cloud/branch/rm) — Delete a project branch
