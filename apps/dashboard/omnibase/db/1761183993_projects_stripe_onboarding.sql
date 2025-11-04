-- Migration: projects_stripe_onboarding
-- Created: 2025-10-23T01:46:33.322Z

-- Add stripe_onboarding_complete column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN projects.stripe_onboarding_complete IS 'Indicates whether Stripe Connect account onboarding has been completed';
