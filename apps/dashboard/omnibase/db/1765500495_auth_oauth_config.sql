-- Migration: auth_oauth_config
-- Created: 2025-12-12T00:48:15.144Z

-- Add your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- Add auth_oauth_config_encrypted column to projects table
-- This stores user-provided OAuth credentials (encrypted JSON)
ALTER TABLE projects ADD COLUMN auth_oauth_config_encrypted TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.auth_oauth_config_encrypted IS 'Encrypted JSON map of OAuth environment variables (OIDC_*_ENABLED, *_CLIENT_ID, *_CLIENT_SECRET)';