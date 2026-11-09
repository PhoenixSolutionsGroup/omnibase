---
title: "List"
---

## Summary

List project branches

## Usage

```bash
omnibase cloud branch list
```

## Description

List all branches for the project with their status and API URL.

Before: a profile must be configured and `project_id` must be set in omnibase.toml (or passed with `--project-id`).

```bash
omnibase cloud branch list
omnibase cloud branch list --project-id proj_123
```

## Options

- **`--project-id <id>`**
  Project ID
