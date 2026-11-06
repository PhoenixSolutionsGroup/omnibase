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

- [`new`](/cli/0.12.0/cloud/branch/new) — Create a new project branch
- [`ensure`](/cli/0.12.0/cloud/branch/ensure) — Provision a branch if it does not exist and wait for it
- [`env`](/cli/0.12.0/cloud/branch/env) — Export branch URLs and keys as environment variables
- [`list`](/cli/0.12.0/cloud/branch/list) — List project branches
- [`rm`](/cli/0.12.0/cloud/branch/rm) — Delete a project branch
