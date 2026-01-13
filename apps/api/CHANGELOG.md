# [0.13.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.6...api-v0.13.0) (2026-01-13)


### Bug Fixes

* **api:** add pattern validation to typegen schemas parameter ([378418b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/378418ba1aad76fbf63e5f1608ff20b95d12f5bd))
* **api:** handle missing products gracefully in archive operation ([d2cb08b](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d2cb08bf008140e0b6e7934692fbc24b79bd81f3))
* **api:** include all stripe IDs in config response ([20fdf21](https://github.com/PhoenixSolutionsGroup/omnibase/commit/20fdf213968d187b24b4e0b01edaf3aef7b3bc4e))
* **api:** rewrite Location and Set-Cookie headers in auth proxy ([6f81cdf](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6f81cdf773a2f25b23aaedc832958da83e9f3217))


### Features

* **api:** add comprehensive health ready endpoint ([c01cf28](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c01cf282b74d6ddfc8ad9d211a6489d1c320c7d9))
* **api:** add database typegen endpoint ([4346e04](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4346e04bcc16a3a9543275081e9b54bb2fc98c57))
* **api:** add enterprise pricing support ([839ef19](https://github.com/PhoenixSolutionsGroup/omnibase/commit/839ef19056587801c47de72501c52888879967d1))
* **api:** add postgrest and typegen to health ready check ([2540408](https://github.com/PhoenixSolutionsGroup/omnibase/commit/254040818387ee71516421efa4c304a7247194da))
* **api:** add stripe coupons and promotion codes support ([9876ddf](https://github.com/PhoenixSolutionsGroup/omnibase/commit/9876ddfe15f7eff02a1ca68e5b797b39a0c4242b))

## [0.12.6](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.5...api-v0.12.6) (2026-01-07)


### Bug Fixes

* **ci:** update git-user-id to phoenixsolutionsgroup from PhoenixSolutionsGroup for go package ([a2f7c3e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/a2f7c3e148f91b16ffa8cf15b703137af8f9fb1f))

## [0.12.5](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.4...api-v0.12.5) (2026-01-07)


### Bug Fixes

* **release:** stage SDK files explicitly in prepare script ([c7cdc4d](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c7cdc4d2475b8f255c592ed0826ba3108304a1b2))

## [0.12.4](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.3...api-v0.12.4) (2026-01-07)


### Bug Fixes

* **ci:** api redeploy ([add8bee](https://github.com/PhoenixSolutionsGroup/omnibase/commit/add8bee2728d92a6669d9fd416acdd5b3f785cc5))

## [0.12.3](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.2...api-v0.12.3) (2026-01-07)


### Bug Fixes

* **cli:** add test mode and refactor docker compose to base + override pattern ([713b302](https://github.com/PhoenixSolutionsGroup/omnibase/commit/713b3021f0f60d3b589afc38c12f0bc154674cdd))

## [0.12.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.1...api-v0.12.2) (2026-01-07)


### Bug Fixes

* **release:** include generated SDK files in release commit ([41e87f5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/41e87f570c313eb674054da73e57a0273020ed05))

## [0.12.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.0...api-v0.12.1) (2026-01-07)


### Bug Fixes

* **release:** add package.json for Go projects ([829ab1c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/829ab1c26705b28cf970dce475ed942aa152c83d))
* **release:** filter commits by package path in changelogs ([35721a1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/35721a19019add4dbf4f64c74ad1c1c6226b0087))

## [0.12.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.12.0...api-v0.12.1) (2026-01-07)


### Bug Fixes

* **release:** add package.json for Go projects ([829ab1c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/829ab1c26705b28cf970dce475ed942aa152c83d))
* **release:** filter commits by package path in changelogs ([35721a1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/35721a19019add4dbf4f64c74ad1c1c6226b0087))

# [0.12.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.11.0...api-v0.12.0) (2026-01-07)


### Bug Fixes

* **release:** add repository field for npm provenance ([d042f55](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d042f55a39e996e6dbc172ffe102de200b81db0d))
* **release:** remove --provenance flag and use npm token auth ([5309948](https://github.com/PhoenixSolutionsGroup/omnibase/commit/53099480197916568874da3a982b55ce0c752a45))
* **release:** use bun publish to resolve workspace dependencies ([4885ee1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4885ee132f9f8735feba5e2d0c55cd8e9773631a))
* **release:** use npm publish with OIDC provenance for trusted publishing ([f837221](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8372211e9d77ee1d7f2059cf1fbe76733b76104))


### Features

* **api:** add tenant lookup endpoints ([64d9850](https://github.com/PhoenixSolutionsGroup/omnibase/commit/64d98500ba1a583d7bd40d8509d00c88ac50bbe6))

# [0.11.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.10.2...api-v0.11.0) (2026-01-05)


### Bug Fixes

* **api:** add missing return after error in UpdateConfig handler ([57a6e29](https://github.com/PhoenixSolutionsGroup/omnibase/commit/57a6e29d860e1ee3649e30ce0b61b747e6ed0b00))
* **api:** add webhook duplicate URL and empty event validation ([6ec19ee](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ec19ee921f1895f908cf85f2bff815a554eafd9))
* **api:** change price amount type to float64 for decimal support ([7b072e4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7b072e48f5611311ea169d8188e7cd4b352d97fa))
* **api:** improve Stripe error handling and invoice ID validation ([4785ec3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4785ec3fc1a5450bd6f12f43c88c37be47575dac))
* **api:** resolve contract test failures for Stripe endpoints ([6faea3a](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6faea3af2116fb86ce6f4e54bc9293e65008bfb3))
* **api:** return empty array instead of null for tenant users ([091058f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/091058f5f5ee8dc9a9a96ffd383bc54cd8227918))
* **api:** treat Keto 400 as 404 for relationship deletion ([79df0c9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/79df0c99012ca8d9868550dce4c4374ad312bf26))
* **ci:** also show logs on workflow cancellation ([19a56b5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/19a56b505e409f7e299df6efa9cdbe648113feb0))
* **ci:** call scripts directly in release-api-prepare ([da13938](https://github.com/PhoenixSolutionsGroup/omnibase/commit/da13938eb460eeeff6aa164ee1a5796d98a3d7e2))
* **ci:** improve Auth readiness checks and add failure logging ([2b35ae8](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2b35ae8ffd52c80a7af67c78d39d31bfbd692ba8))
* **ci:** improve caching in release workflow ([c48ce58](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c48ce58d5bd47c9eb317e392fc748a83c9eaa154))
* **ci:** improve Keto readiness checks to prevent test failures ([965d700](https://github.com/PhoenixSolutionsGroup/omnibase/commit/965d700659255806bb31987c8e77a4273e72471c))
* **ci:** serialize release jobs to prevent race conditions ([ed2e043](https://github.com/PhoenixSolutionsGroup/omnibase/commit/ed2e04324b832c84874d7544ecd6f3845ba4fdf8))
* **ci:** update node version and fix ES module errors in release workflow ([bf97a60](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bf97a60828da514a5b575ab94ca25033abfabc61))
* **ci:** upgrade to Node 24 for npm trusted publishing ([cf5dc10](https://github.com/PhoenixSolutionsGroup/omnibase/commit/cf5dc10128c887b0e439888aa5ad4ec46c754393))
* **ci:** use jq instead of npm for SDK version update ([20dde0e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/20dde0e7894893c492ce141156e01f03456b14f6))
* **cli:** add default values for required Kratos environment variables ([40e99aa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/40e99aae14111d3733bdf34b6a6a5da4e6635417))
* **cli:** add missing adm-zip dependency ([145df41](https://github.com/PhoenixSolutionsGroup/omnibase/commit/145df41ded35c64a80b3da57face700efaba270c))
* **payments:** return proper HTTP status codes for Stripe errors ([3f46cad](https://github.com/PhoenixSolutionsGroup/omnibase/commit/3f46cad9fd61120ee9d376b131e398911f93370c))
* **tests:** increase schemathesis workers and rate limit ([1d0f0b6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1d0f0b6ce6be46f4b4232af809e69393302d3dfb))


### Features

* **api:** add config lookup endpoints for price/product/meter ([b11b30e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/b11b30e33a5da23a7e45c5cefa4749685daa41db))
* **api:** add get single tenant subscription endpoint ([2ce8193](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2ce8193f660a9bd7c6fdbebb9ce0461fc17be024))
* **api:** add invoice line item with price ID endpoint ([abfea49](https://github.com/PhoenixSolutionsGroup/omnibase/commit/abfea49e4fbacb5b13a2fa5e3d6919ae4b890208))
* **cli:** add environment variable expansion for webhook URLs ([c62dedd](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c62dedd58f0bb99bd3dbd8b290a485b8dc19186f))
* **dashboard:** add subscription pricing configuration ([260feb3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/260feb3832bb172435690b736b9ebf135604817c))
* **dashboard:** rewrite provisioning form for new deployment options API ([839d225](https://github.com/PhoenixSolutionsGroup/omnibase/commit/839d225cfe7d3f426a6dec79786dc2036fa53486))
* **payments:** consolidate provider pricing configs and add deployment tracking ([d2b45c4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d2b45c461189d14d109040ff3391b8e129193e14))
* **permissions:** add tenant owner role management permissions ([46fa406](https://github.com/PhoenixSolutionsGroup/omnibase/commit/46fa40642988a1329029d6890ab534f24b98a852))
* **stripe:** support multiple webhooks with pull and cleanup ([f8dea9d](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8dea9d31909be9541203a873a0aa9a92f737b99))

# [0.11.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/api-v0.10.2...api-v0.11.0) (2026-01-05)


### Bug Fixes

* **api:** add webhook duplicate URL and empty event validation ([6ec19ee](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ec19ee921f1895f908cf85f2bff815a554eafd9))
* **api:** change price amount type to float64 for decimal support ([7b072e4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7b072e48f5611311ea169d8188e7cd4b352d97fa))
* **api:** improve Stripe error handling and invoice ID validation ([4785ec3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4785ec3fc1a5450bd6f12f43c88c37be47575dac))
* **api:** return empty array instead of null for tenant users ([091058f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/091058f5f5ee8dc9a9a96ffd383bc54cd8227918))
* **api:** treat Keto 400 as 404 for relationship deletion ([79df0c9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/79df0c99012ca8d9868550dce4c4374ad312bf26))
* **ci:** also show logs on workflow cancellation ([19a56b5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/19a56b505e409f7e299df6efa9cdbe648113feb0))
* **ci:** call scripts directly in release-api-prepare ([da13938](https://github.com/PhoenixSolutionsGroup/omnibase/commit/da13938eb460eeeff6aa164ee1a5796d98a3d7e2))
* **ci:** improve Auth readiness checks and add failure logging ([2b35ae8](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2b35ae8ffd52c80a7af67c78d39d31bfbd692ba8))
* **ci:** improve caching in release workflow ([c48ce58](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c48ce58d5bd47c9eb317e392fc748a83c9eaa154))
* **ci:** improve Keto readiness checks to prevent test failures ([965d700](https://github.com/PhoenixSolutionsGroup/omnibase/commit/965d700659255806bb31987c8e77a4273e72471c))
* **ci:** serialize release jobs to prevent race conditions ([ed2e043](https://github.com/PhoenixSolutionsGroup/omnibase/commit/ed2e04324b832c84874d7544ecd6f3845ba4fdf8))
* **ci:** update node version and fix ES module errors in release workflow ([bf97a60](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bf97a60828da514a5b575ab94ca25033abfabc61))
* **ci:** use jq instead of npm for SDK version update ([20dde0e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/20dde0e7894893c492ce141156e01f03456b14f6))
* **cli:** add default values for required Kratos environment variables ([40e99aa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/40e99aae14111d3733bdf34b6a6a5da4e6635417))
* **cli:** add missing adm-zip dependency ([145df41](https://github.com/PhoenixSolutionsGroup/omnibase/commit/145df41ded35c64a80b3da57face700efaba270c))
* **payments:** return proper HTTP status codes for Stripe errors ([3f46cad](https://github.com/PhoenixSolutionsGroup/omnibase/commit/3f46cad9fd61120ee9d376b131e398911f93370c))
* **tests:** increase schemathesis workers and rate limit ([1d0f0b6](https://github.com/PhoenixSolutionsGroup/omnibase/commit/1d0f0b6ce6be46f4b4232af809e69393302d3dfb))


### Features

* **api:** add config lookup endpoints for price/product/meter ([b11b30e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/b11b30e33a5da23a7e45c5cefa4749685daa41db))
* **api:** add get single tenant subscription endpoint ([2ce8193](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2ce8193f660a9bd7c6fdbebb9ce0461fc17be024))
* **api:** add invoice line item with price ID endpoint ([abfea49](https://github.com/PhoenixSolutionsGroup/omnibase/commit/abfea49e4fbacb5b13a2fa5e3d6919ae4b890208))
* **dashboard:** rewrite provisioning form for new deployment options API ([839d225](https://github.com/PhoenixSolutionsGroup/omnibase/commit/839d225cfe7d3f426a6dec79786dc2036fa53486))
* **payments:** consolidate provider pricing configs and add deployment tracking ([d2b45c4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/d2b45c461189d14d109040ff3391b8e129193e14))
* **permissions:** add tenant owner role management permissions ([46fa406](https://github.com/PhoenixSolutionsGroup/omnibase/commit/46fa40642988a1329029d6890ab534f24b98a852))
* **stripe:** support multiple webhooks with pull and cleanup ([f8dea9d](https://github.com/PhoenixSolutionsGroup/omnibase/commit/f8dea9d31909be9541203a873a0aa9a92f737b99))
