-- Migration: new_project_rls
-- Created: 2025-11-25T02:43:40.605Z

-- Add your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Grant permissions on projects table to anon_user
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO anon_user;

-- Create RLS policy for projects - users can only see/modify projects for their active tenant
CREATE POLICY projects_tenant_access ON projects
    FOR ALL
    TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
    )
    WITH CHECK (
        tenant_id::text = auth.active_tenant_id()
    );
