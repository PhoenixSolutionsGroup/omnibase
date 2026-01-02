# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/cli@0.1.0...@omnibase/cli@0.2.0) (2026-01-02)


### Features

* **payments:** add webhook endpoint management to Stripe configuration ([ca36464](https://github.com/PhoenixSolutionsGroup/omnibase/commit/ca36464567a79f6605eac4116fbaa1050c5620b4))





# [0.1.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/cli@0.0.1...@omnibase/cli@0.1.0) (2026-01-01)


### Code Refactoring

* **permissions:** replace system roles with tenant-scoped role templates ([f149cbd](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f149cbde6adc175ceff5ae892a2da413af7763bd))


* refactor(cli)!: redesign command structure with unified logging and interactive UX ([a72b998](https://github.com/PhoenixSolutionsGroup/omnibase/commit/a72b998a59842fd13a071bb22af911931f28f762))
* I'll analyze the staged changes to generate an appropriate conventional commit message. ([9cca97b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9cca97bae348343f88203137938b128dc388bd78))


### Features

* **cli:** add auth, db, migration, and workers commands ([1e3f796](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1e3f796bff284c1f1d449feb837077db8189180f))
* **cli:** add cloud authentication and improve CLI output formatting ([e8f95f3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e8f95f33bb75caaa37ef1f966705d8d20568885f))
* **cli:** added worker base code in templates so `omnibase init` has it ([53e7622](https://github.com/PhoenixSolutionsGroup/omnibase/commit/53e7622fb54f3bbc080180f45c71104561c564e1))
* **cli:** created service config for better DX ([077f309](https://github.com/PhoenixSolutionsGroup/omnibase/commit/077f309cb97873ff305ae74cf1b8f14f066a2cea))
* **cli:** updated permissions logic to include a base set of `roles` for a permissions set. ([6ea6981](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ea6981d27b63c9dc50e993e0d0cb0b2e65c97ed))


### BREAKING CHANGES

* Command structure changed - `auth login` moved to `cloud login`, `workers deploy` moved to `cloud workers deploy`. Environment variables renamed: API_URL → OMNIBASE_API_URL, OMNIBASE_API_KEY → OMNIBASE_SERVICE_KEY. Commands now show interactive environment picker instead of requiring --env flag.
* **permissions:** All roles must now belong to a tenant. System roles
are cloned from templates during tenant creation instead of shared
across tenants.
* default environment changed from "dev" to "local"





# @omnibase/cli

## 0.0.1

### Patch Changes

- 91f64a0: Updated `omnibase stripe upload` -> `omnibase stripe push` for consistency
