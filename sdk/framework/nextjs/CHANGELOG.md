# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.4](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/nextjs@0.6.3...@omnibase/nextjs@0.6.4) (2026-01-02)


### Bug Fixes

* env var issues ([bdfe006](https://github.com/PhoenixSolutionsGroup/omnibase/commit/bdfe006ab5823f1b5595301dea2c049c55c51553))





## [0.6.3](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/nextjs@0.6.2...@omnibase/nextjs@0.6.3) (2026-01-02)

**Note:** Version bump only for package @omnibase/nextjs





## [0.6.2](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/nextjs@0.6.0...@omnibase/nextjs@0.6.2) (2026-01-01)


### Bug Fixes

* workspace dep ([873ec22](https://github.com/PhoenixSolutionsGroup/omnibase/commit/873ec22664a213e0853fc3b80482c3f1c7a64012))





# [0.6.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/@omnibase/nextjs@0.5.0...@omnibase/nextjs@0.6.0) (2026-01-01)


### Code Refactoring

* **nextjs:** derive auth URL from api_url and remove server action exports ([cd4b975](https://github.com/PhoenixSolutionsGroup/omnibase/commit/cd4b97570d861ea2cfa4a4c60118a0d30ba1f212))


### BREAKING CHANGES

* **nextjs:** The /auth/permissions and /auth/tenants exports have been removed. Auth flow functions (getLoginFlow, getRegistrationFlow, etc.) now require an api_url parameter. Migration: pass process.env.NEXT_PUBLIC_OMNIBASE_API_URL as api_url to all auth flow functions.





# @omnibase/nextjs

## 0.5.2

### Patch Changes

- Updated auth url to get derived from api_url

## 0.5.0

### Minor Changes

- 2971db8: Added API's to update user roles in tenant
- 065f048: Added Protected Route utility function to enforce auth sessions

### Patch Changes

- daf020a: Fixed edge case where middleware would fail for new users before creating a tenant
- Updated dependencies [2971db8]
  - @omnibase/core-js@0.6.0
