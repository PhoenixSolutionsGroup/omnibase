## [0.2.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/permissions-v0.2.0...permissions-v0.2.1) (2026-01-13)


### Bug Fixes

* **release:** add package.json for Go projects ([829ab1c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/829ab1c26705b28cf970dce475ed942aa152c83d))
* **release:** filter commits by package path in changelogs ([35721a1](https://github.com/PhoenixSolutionsGroup/omnibase/commit/35721a19019add4dbf4f64c74ad1c1c6226b0087))

# [0.2.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/permissions-v0.1.1...permissions-v0.2.0) (2026-01-05)


### Bug Fixes

* **api:** add webhook duplicate URL and empty event validation ([6ec19ee](https://github.com/PhoenixSolutionsGroup/omnibase/commit/6ec19ee921f1895f908cf85f2bff815a554eafd9))
* **api:** change price amount type to float64 for decimal support ([7b072e4](https://github.com/PhoenixSolutionsGroup/omnibase/commit/7b072e48f5611311ea169d8188e7cd4b352d97fa))
* **api:** improve Stripe error handling and invoice ID validation ([4785ec3](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4785ec3fc1a5450bd6f12f43c88c37be47575dac))
* **api:** return empty array instead of null for tenant users ([091058f](https://github.com/PhoenixSolutionsGroup/omnibase/commit/091058f5f5ee8dc9a9a96ffd383bc54cd8227918))
* **api:** treat Keto 400 as 404 for relationship deletion ([79df0c9](https://github.com/PhoenixSolutionsGroup/omnibase/commit/79df0c99012ca8d9868550dce4c4374ad312bf26))
* **ci:** also show logs on workflow cancellation ([19a56b5](https://github.com/PhoenixSolutionsGroup/omnibase/commit/19a56b505e409f7e299df6efa9cdbe648113feb0))
* **ci:** improve Auth readiness checks and add failure logging ([2b35ae8](https://github.com/PhoenixSolutionsGroup/omnibase/commit/2b35ae8ffd52c80a7af67c78d39d31bfbd692ba8))
* **ci:** improve caching in release workflow ([c48ce58](https://github.com/PhoenixSolutionsGroup/omnibase/commit/c48ce58d5bd47c9eb317e392fc748a83c9eaa154))
* **ci:** improve Keto readiness checks to prevent test failures ([965d700](https://github.com/PhoenixSolutionsGroup/omnibase/commit/965d700659255806bb31987c8e77a4273e72471c))
* **ci:** update node version and fix ES module errors in release workflow ([bf97a60](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bf97a60828da514a5b575ab94ca25033abfabc61))
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
