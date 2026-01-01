-- Migration: api_key_permissions
-- Rename scopes to permissions and document the expected JSONB structure

-- Rename the column from scopes to permissions for clarity
ALTER TABLE api_keys RENAME COLUMN scopes TO permissions;

-- Add a comment documenting the expected structure
COMMENT ON COLUMN api_keys.permissions IS 'JSONB array of permissions: [{"namespace": "string", "relation": "string", "objectId": "string (optional)"}]';
