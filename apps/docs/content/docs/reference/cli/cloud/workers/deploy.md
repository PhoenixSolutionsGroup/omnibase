---
title: "Deploy"
---

## Summary

Deploy workers to Cloudflare via managed hosting

## Usage

```bash
omnibase cloud workers deploy
```

## Description

Build, package, and upload one or more Workers deployments for the selected cloud branch.

End-to-end flow:
1. Resolve the target environment (`--env` or interactive picker).
2. Load the resolved secrets for that branch (see env resolution below).
3. Run `bunx wrangler deploy --dry-run --outdir .bundle` in the    deployment directory with the resolved env exported, producing a    production bundle.
4. Package the bundle plus any `[assets]` into a self-contained zip,    with the deployment's `wrangler.json` `[vars]` interpolated at    package time.
5. Upload the bundle to managed hosting, which runs    `wrangler deploy --dispatch-namespace` and returns the live URL.

By default a single-deployment project deploys it directly; with multiple deployments you are prompted to select one. `--name` picks a specific deployment by name and `--all` deploys every deployment.

Before: the branch must be provisioned (has a branch ID) and a profile must be configured (`omnibase cloud login`). Deployments must exist in omnibase.toml or `omnibase/workers/`. Cloud environments are required — deploying to `local` is not supported.

Environment variables: `{VAR}` references in the wrangler `[vars]` resolve from the branch env file. See the env resolution model on the [`cloud env`](/reference/cli/cloud/env) page.

Caveats: values in `[vars]` are visible in the deployed worker — put secrets in `wrangler secret` or the managed-hosting secrets API, not in `[vars]`. Unresolved `{VAR}` values are left literal and the CLI warns.

```bash
omnibase cloud workers deploy --env dev
omnibase cloud workers deploy --env staging --name api
omnibase cloud workers deploy --env production --all
```

## Options

- **`--name <name>`**
  Deploy a specific deployment by name
- **`--all`**
  Deploy all deployments
