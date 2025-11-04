-- Migration: extra_project_cols
-- Created: 2025-10-22T01:59:18.828Z

-- Add database password and pooler host columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS database_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS database_pooler_host VARCHAR(255);
