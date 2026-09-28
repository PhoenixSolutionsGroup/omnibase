---
title: "Check"
---

## Summary

Check if a subject has permission

## Usage

```bash
omnibase permissions check
```

## Description

Check whether a subject holds a relation on an object in the permission system, reporting GRANTED or DENIED.

`<subject>` and `<object>` may be `namespace:id` pairs or bare ids — a bare subject defaults to the `User` namespace and a bare object to the `Tenant` namespace.

```bash
omnibase permissions check user:123 tenant:456 view
omnibase permissions check 123 456 invite
omnibase permissions check 123 456 delete --env dev
```

## Arguments

- `subject (required)`
  Subject (e.g., user:123 or just 123)
- `object (required)`
  Object (e.g., tenant:456 or just 456)
- `relation (required)`
  Relation (e.g., invite, delete, view)
