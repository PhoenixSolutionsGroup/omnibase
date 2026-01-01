-- Migration: storage_credentials
-- Created: 2025-12-29T01:11:09.348Z

-- Add storage credential columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS storage_access_key TEXT,
ADD COLUMN IF NOT EXISTS storage_secret_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS storage_endpoint TEXT;
