-- Add subject_relations JSONB column to permissions.definitions
-- Maps subject types to their allowed relations: {"User": ["can_delete"], "ApiKey": ["can_rotate_keys"]}
ALTER TABLE permissions.definitions
ADD COLUMN IF NOT EXISTS subject_relations JSONB DEFAULT '{}';

-- Create GIN index for efficient JSONB key lookups (e.g., WHERE subject_relations ? 'ApiKey')
CREATE INDEX IF NOT EXISTS idx_definitions_subject_relations ON permissions.definitions USING GIN(subject_relations);
