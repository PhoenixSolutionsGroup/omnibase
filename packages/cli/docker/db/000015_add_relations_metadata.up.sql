-- Add relations_metadata JSONB column to permissions.definitions
-- Stores enriched relation metadata including JSDoc annotations (@group, @subGroup, @displayName, @role)
ALTER TABLE permissions.definitions
ADD COLUMN IF NOT EXISTS relations_metadata JSONB DEFAULT '[]';

-- Create GIN index for efficient JSONB queries on relations_metadata
CREATE INDEX IF NOT EXISTS idx_definitions_relations_metadata ON permissions.definitions USING GIN(relations_metadata);
