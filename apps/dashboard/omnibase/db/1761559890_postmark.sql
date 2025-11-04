-- Migration: Switch from Resend to Postmark
-- Created: 2025-10-27T10:11:00.000Z

-- Drop old Resend columns
ALTER TABLE projects
DROP COLUMN IF EXISTS resend_api_key_id,
DROP COLUMN IF EXISTS resend_domain_id,
DROP COLUMN IF EXISTS resend_api_key;

-- Add new Postmark columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS postmark_server_id TEXT,
ADD COLUMN IF NOT EXISTS postmark_server_token TEXT;

-- Add comments for documentation
COMMENT ON COLUMN projects.postmark_server_id IS 'Postmark server ID for this project (used for deletion)';
COMMENT ON COLUMN projects.postmark_server_token IS 'Encrypted Postmark server token for sending emails from this project';
