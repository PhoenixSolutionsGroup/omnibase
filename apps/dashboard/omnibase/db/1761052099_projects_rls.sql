-- Migration: projects_rls
-- Created: 2025-10-21T13:08:19.432Z

-- Enable Row Level Security on projects table
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
