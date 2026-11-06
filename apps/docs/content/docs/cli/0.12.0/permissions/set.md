---
title: "Set"
---

## Summary

Grant a permission relation

## Usage

```bash
omnibase permissions set
```

## Description

Create a relationship granting a subject a relation on an object.

As with `check`, `<subject>` and `<object>` accept `namespace:id` pairs or bare ids defaulting to the `User` and `Tenant` namespaces.

```bash
omnibase permissions set user:123 tenant:456 owners
omnibase permissions set 123 456 can_invite
omnibase permissions set user:123 tenant:456 admins --env dev
```

## Arguments

- `subject (required)`
  Subject (e.g., user:123 or just 123)
- `object (required)`
  Object (e.g., tenant:456 or just 456)
- `relation (required)`
  Relation (e.g., owners, admins, can_invite)
