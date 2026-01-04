-- Migration: deprovisioned_at
-- Created: 2026-01-03T09:37:33.917Z

-- Add deprovisioned_at column to projects table for billing period calculations
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deprovisioned_at TIMESTAMP WITH TIME ZONE;

-- Partial index for efficient queries on deprovisioned projects
CREATE INDEX IF NOT EXISTS idx_projects_deprovisioned_at ON projects(deprovisioned_at) WHERE deprovisioned_at IS NOT NULL;
