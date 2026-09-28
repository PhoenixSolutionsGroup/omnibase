---
title: "Push"
---

## Summary

Push email templates to the API

## Usage

```bash
omnibase email push
```

## Description

Upload one or all HTML email templates from `omnibase/email/` to the selected environment's API (upsert).

With no `[filename]` argument every `*.html` template is uploaded; with one, only that template (matched as `name.html` or `name`) is.

Before: `omnibase/email/` must exist and contain at least one `*.html` file. A running API is required.

After: templates are created or updated in the database. A summary reports successful and failed uploads.

```bash
omnibase email push
omnibase email push welcome
omnibase email push --env dev
```

## Arguments

- `filename`

## Options

- **`--env <environment>`**
  Override environment for this command
