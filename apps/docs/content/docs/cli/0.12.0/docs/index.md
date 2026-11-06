---
title: "Docs"
---

## Summary

Search and read the Omnibase documentation

## Usage

```bash
omnibase docs
```

## Description

Query the public Omnibase documentation from the terminal.

The commands use the docs site's `llms.json` feed, cache it locally for an hour, and default to the latest version of each section. Set `OMNIBASE_DOCS_URL` to use a different docs deployment.

Use `--json` for agent-friendly output.

## Subcommands

- [`list`](/cli/0.12.0/docs/list) — List documentation pages
- [`search`](/cli/0.12.0/docs/search) — Search documentation
- [`get`](/cli/0.12.0/docs/get) — Print a documentation page
