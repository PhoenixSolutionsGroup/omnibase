-- Migration: deletion_project_enums
-- Created: 2025-10-22T06:17:15.916Z

-- Add missing enum values for project deletion workflow
-- The existing enum has: provisioning, provisioned, active, suspended, deprovisioning, deleted, error
-- We need to add: deleting, deletion_failed

ALTER TYPE project_stage ADD VALUE IF NOT EXISTS 'deleting';
ALTER TYPE project_stage ADD VALUE IF NOT EXISTS 'deletion_failed';

-- Note: 'deleting' represents the state when project deletion is in progress
-- Note: 'deletion_failed' represents when deletion encountered errors and needs manual intervention
