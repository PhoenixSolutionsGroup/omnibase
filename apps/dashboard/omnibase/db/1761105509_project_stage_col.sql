-- Migration: project_stage_col
-- Created: 2025-10-22T03:58:29.094Z

-- Create enum type for project lifecycle stages
CREATE TYPE project_stage AS ENUM (
    'provisioning',    -- Project is being created and resources are being provisioned
    'provisioned',     -- Project is fully provisioned and ready to use
    'active',          -- Project is actively running and in use
    'suspended',       -- Project is temporarily suspended (e.g., payment issues)
    'deprovisioning',  -- Project is being deleted and resources are being cleaned up
    'deleted',         -- Project has been fully deleted
    'error'            -- Project provisioning encountered an error
);

-- Add stage column to projects table with default value
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS stage project_stage NOT NULL DEFAULT 'provisioning',
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create index for faster queries by stage
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);

-- Add comments to document the columns
COMMENT ON COLUMN projects.stage IS 'Current lifecycle stage of the project';
COMMENT ON COLUMN projects.error_message IS 'Error message if project provisioning failed';
