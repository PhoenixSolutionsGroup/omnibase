---
title: "Rm"
---

## Summary

Delete a project branch

## Usage

```bash
omnibase cloud branch rm
```

## Description

Delete a branch by name, slug, or ID. The branch is resolved against the project's branch list, then deprovisioning is started.

This is destructive — the branch's database, workers, and services are deprovisioned.

```bash
omnibase cloud branch rm staging
omnibase cloud branch rm br_123 --project-id proj_123
```

## Arguments

- `branch (required)`

## Options

- **`--project-id <id>`**
  Project ID
