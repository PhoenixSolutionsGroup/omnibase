-- Migration: deployment_ids
-- Created: 2026-01-02T22:32:28.434Z

-- Add deployment ID columns to projects
-- These reference pricing configs (e.g., "hetzner_cx22_nbg1", "shared_compute_basic")
ALTER TABLE projects ADD COLUMN IF NOT EXISTS compute_deployment_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS storage_deployment_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS database_deployment_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS email_deployment_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workers_deployment_id VARCHAR(100);

-- Remove redundant provider columns (provider info is in deployment ID lookup)
ALTER TABLE projects DROP COLUMN IF EXISTS database_provider;
ALTER TABLE projects DROP COLUMN IF EXISTS compute_provider;
ALTER TABLE projects DROP COLUMN IF EXISTS storage_provider;
ALTER TABLE projects DROP COLUMN IF EXISTS email_provider;

-- Add deployment ID to vps_hosts
ALTER TABLE vps_hosts ADD COLUMN IF NOT EXISTS deployment_id VARCHAR(100);
