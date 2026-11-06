---
title: "Stop"
---

## Summary

Stop the Docker Compose services

## Usage

```bash
omnibase stop
```

## Description

Stop the local control-plane services started by `omnibase start` and terminate any spawned deployment dev servers.

Runs `docker compose down` for the current compose mode.

```bash
omnibase stop
```
