-- Migration: projects_branching
-- Created: 2025-10-23T22:44:00.000Z

-- Add branching support to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_group_id UUID,
ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100) DEFAULT 'main',
ADD COLUMN IF NOT EXISTS is_default_branch BOOLEAN DEFAULT true;

-- Create index for faster queries by project group
CREATE INDEX IF NOT EXISTS idx_projects_project_group_id ON projects(project_group_id);

-- Create index for faster queries by branch name within a group
CREATE INDEX IF NOT EXISTS idx_projects_group_branch ON projects(project_group_id, branch_name);

-- Add unique constraint to prevent duplicate branch names within a project group
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_unique_branch_per_group 
ON projects(project_group_id, branch_name) 
WHERE project_group_id IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN projects.project_group_id IS 'UUID that groups related project branches together. NULL for standalone projects.';
COMMENT ON COLUMN projects.branch_name IS 'Branch identifier (e.g., main, dev, staging, feature-xyz)';
COMMENT ON COLUMN projects.is_default_branch IS 'Marks the default/main branch of a project group';

-- Ensure existing projects are set up correctly
-- All existing projects become standalone main branches with their own project_group_id
UPDATE projects
SET project_group_id = id,
    branch_name = 'main',
    is_default_branch = true
WHERE project_group_id IS NULL;

-- Make project_group_id NOT NULL after setting defaults
ALTER TABLE projects
ALTER COLUMN project_group_id SET NOT NULL;