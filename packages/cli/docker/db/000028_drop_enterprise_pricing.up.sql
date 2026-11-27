-- Migration: drop_enterprise_pricing
-- Enterprise pricing is replaced by direct Stripe proxy usage.

DROP INDEX IF EXISTS auth.idx_tenants_enterprise_id;
DROP INDEX IF EXISTS auth.idx_tenants_enterprise_template;

ALTER TABLE auth.tenants DROP COLUMN IF EXISTS enterprise_template;
ALTER TABLE auth.tenants DROP COLUMN IF EXISTS enterprise_id;
