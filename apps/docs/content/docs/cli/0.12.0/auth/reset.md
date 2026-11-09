---
title: "Reset"
---

## Summary

Reset (restart) the authentication service

## Usage

```bash
omnibase auth reset
```

## Description

Restart the authentication service.

For the local environment (`--env local` or unset) it restarts the `auth` Docker Compose service. For a cloud environment it calls the branch's API to restart the auth service and reports which services restarted or failed.

Use this after changing auth configuration to pick up the new settings.

```bash
omnibase auth reset
omnibase auth reset --env local
omnibase auth reset --env dev
```
