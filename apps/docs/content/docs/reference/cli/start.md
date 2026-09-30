---
title: "Start"
---

## Summary

Start services and deployment dev servers

## Usage

```bash
omnibase start
```

## Description

Start the local control-plane services with Docker Compose, then spawn a dev server for every deployment configured in omnibase.toml (or `omnibase/workers/`).

The control plane starts with `docker compose up -d`. Each deployment directory runs `bun run dev` on `http://localhost:<port>` (default ports start at 8787 and increment per deployment).

Environment variables: the dev-server processes receive the same resolved env as a cloud deploy — `process.env` → `omnibase/.env.<branch>` (and `omnibase/.env.local` for the local environment), plus the deployment's wrangler `[vars]` after `{VAR}` interpolation. See the env resolution model on the [`cloud env`](/reference/cli/cloud/env) page.

```bash
omnibase start
omnibase start --build
```

## Options

- **`--build`**
  Build images before starting containers
