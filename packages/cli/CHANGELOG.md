# [0.13.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.12.0...cli-v0.13.0) (2026-11-27)

### Bug Fixes

- **api:** renumber email migrations after main ([d7934ff](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d7934ff3adfb58b66d4214437611334042700585))
- better error message when local isn't running ([acd5667](https://github.com/PhoenixSolutionsGroup/omnibase/commit/acd56677ce9737e0749f5c9084fc13fa398774ff))
- **cli:** merge coupons and promotion codes from config files ([af2b76f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/af2b76fe98211b16b01e3a31dc5a76d0286cf3bf))
- **cli:** reject unresolved webhook URLs consistently ([f202967](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f202967e1bb02a992300ef00c5a96967c7a199fd))
- **deployments:** remove deployments name defaulting to 'default' ([c580a32](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c580a3237fab66dabad0fb3f8da14692bc3a2769))
- **deployments:** use <slug>.omnibase-workers.app instead of <slug>.workers.omnibase.tech ([15fe9ac](https://github.com/PhoenixSolutionsGroup/omnibase/commit/15fe9ac1b1ae42436e2bd40e77ba9b5c4e35842d))
- no console logs until omnibase starts ([0e58920](https://github.com/PhoenixSolutionsGroup/omnibase/commit/0e5892093f7e56640a8d2a3706eefa02fa161fd6))
- **payments:** add manage_billing permission ([f85e692](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f85e6922f57d831dfbebde5025bd7bd97494b686))
- restrict invite roles and URLs to prevent owner escalation ([e74d7e5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e74d7e5db0ccb7af4fd725747fc01522cf064864))
- **sdk:** stop tracking core-js dist and build packages before dependents ([6d04e5e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6d04e5e459c905a711e6aa1ae971ea1f6360bf1e))
- update cli to use new provision args ([1adec91](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1adec910d9d6e2fad4ec7b013dc2b966b257dcb5))

### Features

- AGENTS.md file ([7199fc0](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7199fc0fe57d887fe6c6106bccc59cb77f1e6bb2))
- **api:** add tenant, system, and email history schema ([b3bab23](https://github.com/PhoenixSolutionsGroup/omnibase/commit/b3bab239bab383d697a39c07fcccb7e86d1a7c09))
- **api:** validate required config at startup ([cfcd89f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/cfcd89f55ca8a8a4aae978980138608e3655b90f))
- **cli:** add docs commands backed by static llms routes ([956c7b3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/956c7b3876a02282b4b832003585b42c94b34328))
- **cli:** add stripe status command ([e7a6b60](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e7a6b60f30db4649467b03a54fb97c546e82affb))
- **cli:** pin service versions in omnibase init and drop docker-compose sync ([985c217](https://github.com/PhoenixSolutionsGroup/omnibase/commit/985c217b47108762402eb82bc1b9eba9317b7906)), closes [#154](https://github.com/PhoenixSolutionsGroup/omnibase/issues/154)
- **cli:** print a service and deployment URL summary after start ([2705ad4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2705ad473167d249702ffb515f83907224d07673))
- **cli:** run start in the foreground, add -d for detached mode ([f7c892a](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f7c892acfc9ea96b1051af2238b73145775dde94))
- **email:** record delivery history and rate limit sends per tenant ([e894528](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e894528e1404d8d6451861943787865f4130b221))
- **permissions:** add email send and template management permissions ([2f2cd52](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2f2cd528291ed4e61f0cd71a10230e40ec65e962))
- **permissions:** API owns required namespaces and validates projects ([1e94d44](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1e94d44e4c1837ffb2e1043594e65df1f05fd192))
- proxy PostgREST through the API and remove client-held PostgREST tokens ([49d317f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/49d317f00f94a78ac71e719c08ee8f76622e8553))
- **stripe-config:** scope archive-all to managed resources ([1367403](https://github.com/PhoenixSolutionsGroup/omnibase/commit/136740362813e551bfdc90902db2671951f84541))
- **stripe:** depricate stripe endpoints for new stripe proxy ([#210](https://github.com/PhoenixSolutionsGroup/omnibase/issues/210)) ([2d6d400](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2d6d400564bdc6e00ea3a8d4d4cfa0de79621bc9))
- support metadata on stripe products and prices ([f4cf420](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f4cf420869cdb78411fe384d9c9bc473a22880d1))

# [0.12.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.11.0...cli-v0.12.0) (2026-10-29)

### Bug Fixes

- **cli:** restart permissions ([64b799e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/64b799eec257c243a0bd6e5e14757d67b47f0b09))
- **cli:** sync auth docker image to 0.4.4 [skip ci] ([4fac94c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4fac94c95f9b771309ee6135deaee010189285b3))
- **db:** make RLS helpers SECURITY DEFINER and narrow anon_user grants ([471ae36](https://github.com/PhoenixSolutionsGroup/omnibase/commit/471ae36a6419a7d2280fc2f6655d01ad1bbcf79d))
- **db:** move pg_trgm to the auth schema ([5e3f0fa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5e3f0fa36222751c85a8e0955d156d4a25ed33f9))
- **release:** stamp core-js version before packing npm packages ([bcf117e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bcf117ec838e5c5b797a0222ac75180e9aa46b1b))
- upload database migrations as files ([78fb155](https://github.com/PhoenixSolutionsGroup/omnibase/commit/78fb1552cd9642f0d8e225d6dc4f20f3607fa32d))
- upload permissions archive as a file ([d3dbf52](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d3dbf5274b0cc1b5765994de597524531ffa7623))

### Features

- add preview branch CLI commands ([fbd41ca](https://github.com/PhoenixSolutionsGroup/omnibase/commit/fbd41ca089656d6aa6b3f2e0ff2b2852777924dd))
- **api:** add app-key user mode ([4f39053](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4f390532f6ecbe84b86745ed1fac690abf6a43c1))
- **cli:** emit table GRANT/REVOKE from RLS policy codegen ([aad95ce](https://github.com/PhoenixSolutionsGroup/omnibase/commit/aad95ce790608c5ab110bc95a2d08d3460410872))
- **cli:** sync api docker image to 0.21.0 [skip ci] ([edd306c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/edd306c043309a917d776f49243ad4a8240140cb))

# [0.11.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.10.0...cli-v0.11.0) (2026-10-11)

### Bug Fixes

- **cli:** don't fall back to .env.local for branch env resolution ([8f867af](https://github.com/PhoenixSolutionsGroup/omnibase/commit/8f867afd39b2dcd5cb0f4c07661af77b3f8db854))
- **cli:** resolve bundle entry file ([948ee57](https://github.com/PhoenixSolutionsGroup/omnibase/commit/948ee571217a7d0fcb579ae99099ae736a90613b))
- **cli:** sync api docker image to 0.20.5 [skip ci] ([79b8962](https://github.com/PhoenixSolutionsGroup/omnibase/commit/79b8962fb7c922b12f9e84edd0b09f9b5507b719))
- **cli:** sync auth docker image to 0.4.3 [skip ci] ([a2dd03b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/a2dd03bbf012a9b190ea1433d3ee7664b8c42c7b))

### Features

- add domain to workers ([f296668](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f2966681a7ab4eb4f9d3692b2414d15e39f83cb8))
- **cli:** inject branch env into worker builds, vars and env push ([ae3c1e2](https://github.com/PhoenixSolutionsGroup/omnibase/commit/ae3c1e23827a6ba2637918d96ede3ca953fb3d62))
- **cli:** load per-branch env files for config resolution ([d82ad45](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d82ad45681c0252e5b2dcb285a348fa4c6ffe66a))
- **cli:** resolve branch env for omnibase start dev servers ([714f683](https://github.com/PhoenixSolutionsGroup/omnibase/commit/714f6836f16bfe3c3f526c84f9e2d7936a147786))

# [0.10.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.9.0...cli-v0.10.0) (2026-09-16)

### Bug Fixes

- **cli:** skip empty allowed return urls entries ([7f51ff9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7f51ff9d3e25eb62c774d3232dc1cb721558fad9))
- **cli:** sync api docker image to 0.20.4 [skip ci] ([73ac6d2](https://github.com/PhoenixSolutionsGroup/omnibase/commit/73ac6d2879fb963232dd6c4dd608c54e69b45fd2))
- **cli:** sync auth docker image to 0.4.2 [skip ci] ([47f80c5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/47f80c56be3350e973a47d251290e20c5362b4cb))

### Features

- **cli:** Application version pinning ([5ebd13b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5ebd13bc12562bf3f54bdcfb306a785b0452cfce))

# [0.9.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.8.1...cli-v0.9.0) (2026-08-25)

### Features

- **cli:** drive local and cloud config from omnibase.toml ([0b19bc4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/0b19bc4c1f0c2188cfc6f9ba31b7f9eefdbda7aa))

## [0.8.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.8.0...cli-v0.8.1) (2026-07-24)

### Bug Fixes

- **cli:** sync api docker image to 0.20.2 [skip ci] ([05cc3bf](https://github.com/PhoenixSolutionsGroup/omnibase/commit/05cc3bf06d2da95fc38ebdb3db6b3a6c469d1946))
- **cli:** sync api docker image to 0.20.3 [skip ci] ([5daae6f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5daae6f27fbe6cebab6871161f1dee85aa5d264d))

# [0.8.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.7.0...cli-v0.8.0) (2026-07-24)

### Bug Fixes

- Add Service Key to docker-compose and tests ([f98fdd5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f98fdd5e5b6242c4c4041cb29ea890785ad8259c))
- **cli:** sync api docker image to 0.20.1 [skip ci] ([73c65ce](https://github.com/PhoenixSolutionsGroup/omnibase/commit/73c65ce22f63014c8060882db20c341631f1436c))
- Dashboard Patches ([#48](https://github.com/PhoenixSolutionsGroup/omnibase/issues/48)) ([9c62ebb](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9c62ebb14fbff33704be291e98dc40acad1ae476))

### Features

- **cli:** enhance worker deployment options ([c655f25](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c655f25ca2c34b8b0b8c415637e83a2af603b900))

# [0.7.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.6.0...cli-v0.7.0) (2026-07-07)

### Bug Fixes

- **cli:** drop legacy data envelope, SDK responses are unwrapped ([0783815](https://github.com/PhoenixSolutionsGroup/omnibase/commit/07838150f160759aee49db273f79296ef45260da))
- **cli:** sync api docker image to 0.19.1 [skip ci] ([27f9f57](https://github.com/PhoenixSolutionsGroup/omnibase/commit/27f9f57dcd4473ada470bc9d10795693b1905f15))

### Features

- **api:** wire SDK gen from huma spec + split tenants tag + API_VERSION env ([bd7fcdc](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bd7fcdc0e5eb7e7591aff834950ea383490063d2))
- **cli:** sync api docker image to 0.20.0 [skip ci] ([9227298](https://github.com/PhoenixSolutionsGroup/omnibase/commit/922729898e56b4c2a6a709b1c5f5a2138e2c8270))
- Prisma Schema + Down Migrations + definePolicy RLS Compiler ([2120c4a](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2120c4a1842bdf50efc17e741a5f638c3b633903))

# [0.6.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.5.0...cli-v0.6.0) (2026-05-30)

### Bug Fixes

- **api:** add CORS_ALLOWED_ORIGINS to compose and drop typegen from readiness ([2357c97](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2357c978237430b545eb116e23eab9c9989a67a0))
- **api:** handle FK violations, SELinux mounts, and contract test gaps ([7686e20](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7686e2052d7cd275076a18844d3df88c52da39e6))
- **cli:** sync api docker image to 0.18.1 [skip ci] ([5bdd48b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5bdd48bbf836c6de8b4e38b50849676fbad3b40b))
- **cli:** sync auth docker image to 0.4.1 [skip ci] ([09da3f4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/09da3f4766f8e41fec06dd00b979e7b30dd9d5f6))

### Features

- **cli:** sync api docker image to 0.19.0 [skip ci] ([5d57a1f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/5d57a1f49d3690519ba9b8f221a44f02ab1e2b99))
- **cli:** sync permissions docker image to 0.4.0 [skip ci] ([1f90880](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1f908805ddd9d7bc3088435bb77d68994e980f20))
- **db:** add ReBAC RLS helpers and replace path-based storage policies ([51f9463](https://github.com/PhoenixSolutionsGroup/omnibase/commit/51f9463d999d7010eb08af9fc239a822d2cd2f5f))
- mcp server ([52f2a74](https://github.com/PhoenixSolutionsGroup/omnibase/commit/52f2a741476cefaf6f00be9ed892020056fb8216))
- **permissions:** add StorageObject OPL namespace for per-object access control ([4bf0ed6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4bf0ed67be6218d21237ea5f4d31a0327ced6ce4))

# [0.5.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.4.1...cli-v0.5.0) (2026-02-06)

### Features

- **api:** add JSDoc metadata parsing for permission relations ([6ad5a80](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ad5a8083f21672a02f76c9091c0b82f2f585921))
- **cli:** sync api docker image to 0.18.0 [skip ci] ([8e914eb](https://github.com/PhoenixSolutionsGroup/omnibase/commit/8e914eb0751ad4d2087bef0654f16bad0ad4238a))

## [0.4.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.4.0...cli-v0.4.1) (2026-02-03)

### Bug Fixes

- **cli:** use package.json version instead of hardcoded 1.0.0 [skip tests] ([84b8d84](https://github.com/PhoenixSolutionsGroup/omnibase/commit/84b8d841b8a8e3764b3a3c70c0a318d8d631cdcc))

# [0.4.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.2...cli-v0.4.0) (2026-01-22)

### Bug Fixes

- **cli:** update docker image versions to latest releases ([6caa097](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6caa0978fdff9d7bb90c52610edeb879c4096cc1))

### Features

- **cli:** sync api docker image to 0.17.0 [skip ci] ([4692e1a](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4692e1ad3d89f8e516b1363a5871aa4a4dda60c2))
- **cli:** sync auth docker image to 0.4.0 [skip ci] ([7c65702](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7c6570200e66d026d582c834726e328204e005cc))
- **cli:** sync permissions docker image to 0.3.0 [skip ci] ([fa71034](https://github.com/PhoenixSolutionsGroup/omnibase/commit/fa71034b6ca0d901407cf666b0dd55580aa6cb53))

## [0.3.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.1...cli-v0.3.2) (2026-01-22)

### Bug Fixes

- **docker:** update argon2 hasher configuration ([68c3049](https://github.com/PhoenixSolutionsGroup/omnibase/commit/68c3049d316aa2daace2d03f97216adaa057740b))

## [0.3.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.3.0...cli-v0.3.1) (2026-01-21)

### Bug Fixes

- **cli:** add argon2 hasher defaults for auth service ([9f577b9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9f577b9fb17c3301e880a9b276187ce81d2c071f))

# [0.3.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.2...cli-v0.3.0) (2026-01-21)

### Features

- **cli:** replace MinIO with RustFS for local object storage ([2c93d4c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2c93d4c7ae8f5ae760d26d17f4dd780a58c1d15b))

## [0.2.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.1...cli-v0.2.2) (2026-01-15)

### Bug Fixes

- **release:** use find instead of glob for .d.ts file check ([38ea742](https://github.com/PhoenixSolutionsGroup/omnibase/commit/38ea742fd2735cce8b6dfeeeba26946a7f0f66f1))

## [0.2.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.2.0...cli-v0.2.1) (2026-01-15)

### Bug Fixes

- **release:** build TypeScript declarations before npm publish ([45298b6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/45298b6d4b3ddc464760a3361f694ed56526ce2f))

# [0.2.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.1.0...cli-v0.2.0) (2026-01-14)

### Bug Fixes

- **cli:** add default values for required Kratos environment variables ([40e99aa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/40e99aae14111d3733bdf34b6a6a5da4e6635417))
- **cli:** add missing adm-zip dependency ([145df41](https://github.com/PhoenixSolutionsGroup/omnibase/commit/145df41ded35c64a80b3da57face700efaba270c))
- **cli:** add postgres healthcheck and wait for healthy state ([0b443d6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/0b443d65e2d7b0c9c016ff3e566cfe75347cff57))
- **cli:** add test mode and refactor docker compose to base + override pattern ([713b302](https://github.com/PhoenixSolutionsGroup/omnibase/commit/713b3021f0f60d3b589afc38c12f0bc154674cdd))
- **cli:** show docker compose output during execution ([e910727](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e91072798cec9eaaf65814023af1db6c7caa068f))
- **docker:** add API_PUBLIC_URL for browser-facing auth redirects ([4657787](https://github.com/PhoenixSolutionsGroup/omnibase/commit/465778737b79697ec240c3c575c3a9cc19530aee))
- **release:** add repository field for npm provenance ([d042f55](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d042f55a39e996e6dbc172ffe102de200b81db0d))
- **release:** filter commits by package path in changelogs ([35721a1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/35721a19019add4dbf4f64c74ad1c1c6226b0087))
- **release:** remove --provenance flag and use npm token auth ([5309948](https://github.com/PhoenixSolutionsGroup/omnibase/commit/53099480197916568874da3a982b55ce0c752a45))
- **release:** use bun publish to resolve workspace dependencies ([4885ee1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4885ee132f9f8735feba5e2d0c55cd8e9773631a))
- **release:** use npm publish with OIDC provenance for trusted publishing ([f837221](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8372211e9d77ee1d7f2059cf1fbe76733b76104))

### Features

- **api:** add database typegen endpoint ([4346e04](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4346e04bcc16a3a9543275081e9b54bb2fc98c57))
- **api:** add enterprise pricing support ([839ef19](https://github.com/PhoenixSolutionsGroup/omnibase/commit/839ef19056587801c47de72501c52888879967d1))
- **api:** add stripe coupons and promotion codes support ([9876ddf](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9876ddfe15f7eff02a1ca68e5b797b39a0c4242b))
- **cli:** add environment variable expansion for webhook URLs ([c62dedd](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c62dedd58f0bb99bd3dbd8b290a485b8dc19186f))
- **docker:** add workers service and require email verification ([d85cf48](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d85cf484ab0a616ede8ecdafd68994ff825c9ecd))
- **permissions:** add tenant owner role management permissions ([46fa406](https://github.com/PhoenixSolutionsGroup/omnibase/commit/46fa40642988a1329029d6890ab534f24b98a852))
- **stripe:** support multiple webhooks with pull and cleanup ([f8dea9d](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8dea9d31909be9541203a873a0aa9a92f737b99))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/cli@0.1.0...@omnibase/cli@0.2.0) (2026-01-02)

### Features

- **payments:** add webhook endpoint management to Stripe configuration ([ca36464](https://github.com/PhoenixSolutionsGroup/omnibase/commit/ca36464567a79f6605eac4116fbaa1050c5620b4))

# [0.1.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/cli@0.0.1...@omnibase/cli@0.1.0) (2026-01-01)

### Code Refactoring

- **permissions:** replace system roles with tenant-scoped role templates ([f149cbd](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f149cbde6adc175ceff5ae892a2da413af7763bd))

- refactor(cli)!: redesign command structure with unified logging and interactive UX ([a72b998](https://github.com/PhoenixSolutionsGroup/omnibase/commit/a72b998a59842fd13a071bb22af911931f28f762))
- I'll analyze the staged changes to generate an appropriate conventional commit message. ([9cca97b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9cca97bae348343f88203137938b128dc388bd78))

### Features

- **cli:** add auth, db, migration, and workers commands ([1e3f796](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1e3f796bff284c1f1d449feb837077db8189180f))
- **cli:** add cloud authentication and improve CLI output formatting ([e8f95f3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/e8f95f33bb75caaa37ef1f966705d8d20568885f))
- **cli:** added worker base code in templates so `omnibase init` has it ([53e7622](https://github.com/PhoenixSolutionsGroup/omnibase/commit/53e7622fb54f3bbc080180f45c71104561c564e1))
- **cli:** created service config for better DX ([077f309](https://github.com/PhoenixSolutionsGroup/omnibase/commit/077f309cb97873ff305ae74cf1b8f14f066a2cea))
- **cli:** updated permissions logic to include a base set of `roles` for a permissions set. ([6ea6981](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ea6981d27b63c9dc50e993e0d0cb0b2e65c97ed))

### BREAKING CHANGES

- Command structure changed - `auth login` moved to `cloud login`, `workers deploy` moved to `cloud workers deploy`. Environment variables renamed: API_URL → OMNIBASE_API_URL, OMNIBASE_API_KEY → OMNIBASE_SERVICE_KEY. Commands now show interactive environment picker instead of requiring --env flag.
- **permissions:** All roles must now belong to a tenant. System roles
  are cloned from templates during tenant creation instead of shared
  across tenants.
- default environment changed from "dev" to "local"

# @omnibase/cli

## 0.0.1

### Patch Changes

- 91f64a0: Updated `omnibase stripe upload` -> `omnibase stripe push` for consistency
