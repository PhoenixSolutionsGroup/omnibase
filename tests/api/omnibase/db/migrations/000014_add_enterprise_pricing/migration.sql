-- Migration: add_enterprise_pricing
-- Add enterprise pricing fields to tenants table for template-based and custom enterprise pricing

ALTER TABLE auth.tenants ADD COLUMN IF NOT EXISTS enterprise_template VARCHAR(255);
ALTER TABLE auth.tenants ADD COLUMN IF NOT EXISTS enterprise_id VARCHAR(255);

-- Index for efficient lookups by enterprise_id
CREATE INDEX IF NOT EXISTS idx_tenants_enterprise_id ON auth.tenants(enterprise_id) WHERE enterprise_id IS NOT NULL;

-- Index for efficient lookups by enterprise_template
CREATE INDEX IF NOT EXISTS idx_tenants_enterprise_template ON auth.tenants(enterprise_template) WHERE enterprise_template IS NOT NULL;
