-- Migration: add_resend_api_key_id_projects
-- Created: 2025-10-22T05:11:27.979Z

-- Add column for storing Resend API key ID
ALTER TABLE projects
ADD COLUMN resend_api_key_id VARCHAR(255) NULL;

-- Add comment
COMMENT ON COLUMN projects.resend_api_key_id IS 'Resend API key ID for deletion purposes';
