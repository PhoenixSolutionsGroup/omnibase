# [0.6.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.5.0...cli-v0.6.0) (2026-05-30)


### Bug Fixes

* **api:** add CORS_ALLOWED_ORIGINS to compose and drop typegen from readiness ([2357c97](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2357c978237430b545eb116e23eab9c9989a67a0))
* **api:** handle FK violations, SELinux mounts, and contract test gaps ([7686e20](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7686e2052d7cd275076a18844d3df88c52da39e6))
* **cli:** sync api docker image to 0.18.1 [skip ci] ([5bdd48b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5bdd48bbf836c6de8b4e38b50849676fbad3b40b))
* **cli:** sync auth docker image to 0.4.1 [skip ci] ([09da3f4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/09da3f4766f8e41fec06dd00b979e7b30dd9d5f6))


### Features

* **cli:** sync api docker image to 0.19.0 [skip ci] ([5d57a1f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5d57a1f49d3690519ba9b8f221a44f02ab1e2b99))
* **cli:** sync permissions docker image to 0.4.0 [skip ci] ([1f90880](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1f908805ddd9d7bc3088435bb77d68994e980f20))
* **db:** add ReBAC RLS helpers and replace path-based storage policies ([51f9463](https://github.com/PhoenixSolutionsGroup/omnibase/commit/51f9463d999d7010eb08af9fc239a822d2cd2f5f))
* mcp server ([52f2a74](https://github.com/PhoenixSolutionsGroup/omnibase/commit/52f2a741476cefaf6f00be9ed892020056fb8216))
* **permissions:** add StorageObject OPL namespace for per-object access control ([4bf0ed6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4bf0ed67be6218d21237ea5f4d31a0327ced6ce4))

# [0.5.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.4.1...cli-v0.5.0) (2026-02-06)


### Features

* **api:** add JSDoc metadata parsing for permission relations ([6ad5a80](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ad5a8083f21672a02f76c9091c0b82f2f585921))
* **cli:** sync api docker image to 0.18.0 [skip ci] ([8e914eb](https://github.com/PhoenixSolutionsGroup/omnibase/commit/8e914eb0751ad4d2087bef0654f16bad0ad4238a))

## [0.4.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.4.0...cli-v0.4.1) (2026-02-03)


### Bug Fixes

* **cli:** use package.json version instead of hardcoded 1.0.0 [skip tests] ([84b8d84](https://github.com/PhoenixSolutionsGroup/omnibase/commit/84b8d841b8a8e3764b3a3c70c0a318d8d631cdcc))

# [0.4.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.2...cli-v0.4.0) (2026-01-22)


### Bug Fixes

* **cli:** update docker image versions to latest releases ([6caa097](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6caa0978fdff9d7bb90c52610edeb879c4096cc1))


### Features

* **cli:** sync api docker image to 0.17.0 [skip ci] ([4692e1a](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4692e1ad3d89f8e516b1363a5871aa4a4dda60c2))
* **cli:** sync auth docker image to 0.4.0 [skip ci] ([7c65702](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7c6570200e66d026d582c834726e328204e005cc))
* **cli:** sync permissions docker image to 0.3.0 [skip ci] ([fa71034](https://github.com/PhoenixSolutionsGroup/omnibase/commit/fa71034b6ca0d901407cf666b0dd55580aa6cb53))

## [0.3.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.1...cli-v0.3.2) (2026-01-22)


### Bug Fixes

* **docker:** update argon2 hasher configuration ([68c3049](https://github.com/PhoenixSolutionsGroup/omnibase/commit/68c3049d316aa2daace2d03f97216adaa057740b))

## [0.3.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.0...cli-v0.3.1) (2026-01-21)


### Bug Fixes

* **cli:** add argon2 hasher defaults for auth service ([9f577b9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9f577b9fb17c3301e880a9b276187ce81d2c071f))

# [0.3.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.2...cli-v0.3.0) (2026-01-21)


### Features

* **cli:** replace MinIO with RustFS for local object storage ([2c93d4c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2c93d4c7ae8f5ae760d26d17f4dd780a58c1d15b))

## [0.2.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.1...cli-v0.2.2) (2026-01-15)


### Bug Fixes

* **release:** use find instead of glob for .d.ts file check ([38ea742](https://github.com/PhoenixSolutionsGroup/omnibase/commit/38ea742fd2735cce8b6dfeeeba26946a7f0f66f1))

## [0.2.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.0...cli-v0.2.1) (2026-01-15)


### Bug Fixes

* **release:** build TypeScript declarations before npm publish ([45298b6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/45298b6d4b3ddc464760a3361f694ed56526ce2f))

# [0.2.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.1.0...cli-v0.2.0) (2026-01-14)


### Bug Fixes

* **cli:** add default values for required Kratos environment variables ([40e99aa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/40e99aae14111d3733bdf34b6a6a5da4e6635417))
* **cli:** add missing adm-zip dependency ([145df41](https://github.com/PhoenixSolutionsGroup/omnibase/commit/145df41ded35c64a80b3da57face700efaba270c))
* **cli:** add postgres healthcheck and wait for healthy state ([0b443d6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/0b443d65e2d7b0c9c016ff3e566cfe75347cff57))
* **cli:** add test mode and refactor docker compose to base + override pattern ([713b302](https://github.com/PhoenixSolutionsGroup/omnibase/commit/713b3021f0f60d3b589afc38c12f0bc154674cdd))
* **cli:** show docker compose output during execution ([e910727](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e91072798cec9eaaf65814023af1db6c7caa068f))
* **docker:** add API_PUBLIC_URL for browser-facing auth redirects ([4657787](https://github.com/PhoenixSolutionsGroup/omnibase/commit/465778737b79697ec240c3c575c3a9cc19530aee))
* **release:** add repository field for npm provenance ([d042f55](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d042f55a39e996e6dbc172ffe102de200b81db0d))
* **release:** filter commits by package path in changelogs ([35721a1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/35721a19019add4dbf4f64c74ad1c1c6226b0087))
* **release:** remove --provenance flag and use npm token auth ([5309948](https://github.com/PhoenixSolutionsGroup/omnibase/commit/53099480197916568874da3a982b55ce0c752a45))
* **release:** use bun publish to resolve workspace dependencies ([4885ee1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4885ee132f9f8735feba5e2d0c55cd8e9773631a))
* **release:** use npm publish with OIDC provenance for trusted publishing ([f837221](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8372211e9d77ee1d7f2059cf1fbe76733b76104))


### Features

* **api:** add database typegen endpoint ([4346e04](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4346e04bcc16a3a9543275081e9b54bb2fc98c57))
* **api:** add enterprise pricing support ([839ef19](https://github.com/PhoenixSolutionsGroup/omnibase/commit/839ef19056587801c47de72501c52888879967d1))
* **api:** add stripe coupons and promotion codes support ([9876ddf](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9876ddfe15f7eff02a1ca68e5b797b39a0c4242b))
* **cli:** add environment variable expansion for webhook URLs ([c62dedd](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c62dedd58f0bb99bd3dbd8b290a485b8dc19186f))
* **docker:** add workers service and require email verification ([d85cf48](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d85cf484ab0a616ede8ecdafd68994ff825c9ecd))
* **permissions:** add tenant owner role management permissions ([46fa406](https://github.com/PhoenixSolutionsGroup/omnibase/commit/46fa40642988a1329029d6890ab534f24b98a852))
* **stripe:** support multiple webhooks with pull and cleanup ([f8dea9d](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8dea9d31909be9541203a873a0aa9a92f737b99))

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
