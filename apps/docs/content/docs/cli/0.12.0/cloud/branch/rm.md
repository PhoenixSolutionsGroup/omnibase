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

This is destructive — the branch's database, workers, and services are deprovisioned. `--if-exists` makes a missing or already deleted branch a no-op, which is useful in cleanup jobs.

```bash
omnibase cloud branch rm staging
omnibase cloud branch rm pr-123 --if-exists
omnibase cloud branch rm br_123 --project-id proj_123
```

## Arguments

- `branch (required)`

## Options

- **`--project-id <id>`**
  Project ID
- **`--if-exists`**
  Do not fail if the branch is missing or deleted
