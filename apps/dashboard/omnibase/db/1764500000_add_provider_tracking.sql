-- Migration: Add provider tracking columns to projects table
-- This migration adds explicit provider name columns for database, compute, storage, and email providers
-- to enable better analytics, cost tracking, and deprovisioning logic.
--
-- Author: Architect Mode
-- Date: 2025-12-07

-- Add provider tracking columns (all nullable for backward compatibility)
ALTER TABLE projects ADD COLUMN database_provider VARCHAR(50);
ALTER TABLE projects ADD COLUMN compute_provider VARCHAR(50);
ALTER TABLE projects ADD COLUMN storage_provider VARCHAR(50);
ALTER TABLE projects ADD COLUMN email_provider VARCHAR(50);

-- Add helpful comments for each column
COMMENT ON COLUMN projects.database_provider IS 'Database provider used: neon, shared_postgres, gcp_cloudsql, render';
COMMENT ON COLUMN projects.compute_provider IS 'Compute provider used: gcp_cloudrun, hetzner, gcp_vps, aws_ec2';
COMMENT ON COLUMN projects.storage_provider IS 'Storage provider used: cloudflare_r2, shared_minio, aws_s3, gcp_gcs';
COMMENT ON COLUMN projects.email_provider IS 'Email provider used: postmark, resend, sendgrid';

-- Add indexes for analytics queries (optional but recommended for performance)
CREATE INDEX idx_projects_database_provider ON projects(database_provider) WHERE database_provider IS NOT NULL;
CREATE INDEX idx_projects_compute_provider ON projects(compute_provider) WHERE compute_provider IS NOT NULL;
CREATE INDEX idx_projects_storage_provider ON projects(storage_provider) WHERE storage_provider IS NOT NULL;
CREATE INDEX idx_projects_email_provider ON projects(email_provider) WHERE email_provider IS NOT NULL;
