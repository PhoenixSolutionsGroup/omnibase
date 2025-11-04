-- Migration: project_events
-- Created: 2025-10-22T02:54:50.061Z

-- Add your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

CREATE TRIGGER projects_state_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_state_change();