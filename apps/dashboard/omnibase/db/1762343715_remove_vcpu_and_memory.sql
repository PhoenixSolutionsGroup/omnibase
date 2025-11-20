-- Migration: remove_vcpu_and_memory
-- Created: 2025-11-05T11:55:15.046Z

-- Rename cloudrun_billable_time to cloudrun_billable_time_seconds for clarity
ALTER TABLE usage_metrics 
RENAME COLUMN cloudrun_billable_time TO cloudrun_billable_time_seconds;

-- Drop the redundant vCPU and memory columns
ALTER TABLE usage_metrics 
DROP COLUMN IF EXISTS cloudrun_vcpu_hours,
DROP COLUMN IF EXISTS cloudrun_memory_gb_hours;

-- Update any existing views or functions that reference these columns
-- (Add specific view/function updates if needed)
