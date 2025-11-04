-- Migration: add_postgrest_keys
-- Created: 2025-10-28T11:16:12.668Z

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS anon_key TEXT,
ADD COLUMN IF NOT EXISTS service_key TEXT;