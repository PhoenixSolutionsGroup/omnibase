-- Migration: env_config
-- Created: 2025-12-28T23:25:21.328Z

-- Add environment configuration columns for all services
-- EnvConfigBaseEncrypted: Snapshot at provision time (original state, used for reset)
-- EnvConfigEncrypted: Current state (base + user overrides merged)

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS env_config_base_encrypted TEXT,
ADD COLUMN IF NOT EXISTS env_config_encrypted TEXT;

COMMENT ON COLUMN projects.env_config_base_encrypted IS 'Encrypted JSON containing original env config at provision time. Structure: {"auth": {...}, "api": {...}, ...}';
COMMENT ON COLUMN projects.env_config_encrypted IS 'Encrypted JSON containing current env config (base + user overrides). Structure: {"auth": {...}, "api": {...}, ...}';
