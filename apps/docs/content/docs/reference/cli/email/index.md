---
title: "Email"
---

## Summary

Manage email templates

## Usage

```bash
omnibase email
```

## Description

List and upload HTML email templates from `omnibase/email/` to the API.

Each `*.html` file in `omnibase/email/` becomes a template; the file name (with dashes and capitals normalized) is used as the template type and subject.

## Subcommands

- [`push`](/reference/cli/email/push) — Push email templates to the API
- [`list`](/reference/cli/email/list) — List email templates in the project
