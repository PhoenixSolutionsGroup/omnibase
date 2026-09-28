---
title: "New"
---

## Summary

Create a new project branch

## Usage

```bash
omnibase cloud branch new
```

## Description

Provision a new branch (environment) for the project.

The project ID comes from `--project-id` or the `project_id` in omnibase.toml, and is prompted for if neither is set. Region and tier default to a picker fed by the managed hosting options endpoint (falling back to `syd` / `shared` prompts). A billing email is required.

After: provisioning starts asynchronously. Once complete, use the branch with `--env <branch>` on other commands.

```bash
omnibase cloud branch new --name staging
omnibase cloud branch new --project-id proj_123 --name dev --region syd --tier shared
```

## Options

- **`--project-id <id>`**
  Project ID
- **`--name <name>`**
  Branch name
- **`--region <region>`**
  Region (e.g. syd)
- **`--tier <tier>`**
  Deployment tier (e.g. shared)
- **`--email <email>`**
  Billing email
