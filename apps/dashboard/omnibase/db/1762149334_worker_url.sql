-- Migration: worker_url
-- Created: 2025-11-03T05:55:34.856Z

-- Add worker_url column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS worker_url TEXT;

-- Add comment to the column for documentation
COMMENT ON COLUMN projects.worker_url IS 'Cloudflare Worker URL for this project (e.g., https://project-{uuid}.workers.dev)';
