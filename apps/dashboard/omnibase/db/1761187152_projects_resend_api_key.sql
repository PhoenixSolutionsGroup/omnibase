-- Migration: projects_resend_api_key
-- Created: 2025-10-23T02:41:00.000Z

-- Add resend_api_key column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS resend_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.resend_api_key IS 'Encrypted Resend API key for sending emails from this project';
