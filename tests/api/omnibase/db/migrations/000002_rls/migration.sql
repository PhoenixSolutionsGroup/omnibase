
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS text AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'user_id';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.active_tenant_id()
RETURNS text AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'tenant_id';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.active_user_role()
RETURNS text AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'user_role';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.user_tenant_ids()
RETURNS text[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT tenant_id
        FROM auth.tenant_users
        WHERE user_id = auth.user_id()
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create PostgREST database roles (idempotent - safe to run multiple times)
-- For shared Postgres: Roles are created by provisioning system as admin
-- For managed services (Neon): Admin user creates them here on first run
-- Uses nested exception handling to gracefully handle:
--   1. insufficient_privilege: Roles pre-created by admin, tenant user can't create roles
--   2. duplicate_object: Role already exists
DO $$
BEGIN
    -- Create anon_user if it doesn't exist
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon_user') THEN
            CREATE ROLE anon_user;
        END IF;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Skipping CREATE ROLE anon_user - insufficient permissions (pre-created by admin)';
        WHEN duplicate_object THEN
            NULL; -- Role already exists
    END;

    -- Create super_user if it doesn't exist
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'super_user') THEN
            CREATE ROLE super_user;
        END IF;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Skipping CREATE ROLE super_user - insufficient permissions (pre-created by admin)';
        WHEN duplicate_object THEN
            NULL; -- Role already exists
    END;
END $$;

GRANT USAGE ON SCHEMA public, auth, storage TO anon_user;
GRANT USAGE ON SCHEMA public, auth, storage, stripe TO super_user;

-- Grant sequence usage for INSERT operations (only for super_user)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO super_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO super_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO super_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA stripe TO super_user;

-- Super user: bypass RLS
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO super_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO super_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO super_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stripe TO super_user;

-- Only alter super_user if we have permission (admin user or first tenant in shared Postgres)
-- Uses try/catch to gracefully handle permission errors
DO $$
BEGIN
    BEGIN
        ALTER ROLE super_user SET row_security = off;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Skipping ALTER ROLE super_user - insufficient permissions (already configured)';
        WHEN OTHERS THEN
            -- Catch any other errors and log them
            RAISE NOTICE 'Could not alter super_user: % (%)', SQLERRM, SQLSTATE;
    END;
END $$;

-- Set default privileges for future tables (only super_user gets direct access)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO super_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO super_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO super_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA stripe GRANT ALL ON TABLES TO super_user;

GRANT SELECT ON auth.tenants TO anon_user;
GRANT SELECT ON auth.tenant_users TO anon_user;
GRANT SELECT ON auth.tenant_settings TO anon_user;
GRANT SELECT ON auth.tenant_invites TO anon_user;

-- Grant permissions on storage tables
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon_user;

-- Enable Row Level Security only on auth tables by default
ALTER TABLE auth.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.tenant_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anon_user on auth tables only
CREATE POLICY tenant_users_user_access ON auth.tenant_users
    FOR SELECT
    TO anon_user
    USING (
        user_id = auth.user_id()
    );

CREATE POLICY tenants_member_access ON auth.tenants
    FOR SELECT
    TO anon_user
    USING (
        id = ANY(auth.user_tenant_ids())
    );

CREATE POLICY tenant_settings_access ON auth.tenant_settings
    FOR SELECT
    TO anon_user
    USING (
        tenant_id = auth.active_tenant_id()
    );

CREATE POLICY tenant_invites_access ON auth.tenant_invites
    FOR SELECT
    TO anon_user
    USING (
        tenant_id = auth.active_tenant_id()
    );

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;


-- Allow public directory read access
CREATE POLICY storage_objects_public_read ON storage.objects
    FOR SELECT
    TO anon_user
    USING (
        split_part(path, '/', 1) = 'public'
    );

-- Allow authenticated users to upload to public directory
CREATE POLICY storage_objects_public_insert ON storage.objects
    FOR INSERT
    TO anon_user
    WITH CHECK (
        split_part(path, '/', 1) = 'public' AND
        user_id = auth.user_id()
    );

-- Allow users full control over their own files (any path)
CREATE POLICY storage_objects_user_all ON storage.objects
    FOR ALL
    TO anon_user
    USING (
        user_id = auth.user_id()
    )
    WITH CHECK (
        user_id = auth.user_id()
    );

-- Allow tenant members to read shared files
CREATE POLICY storage_objects_tenant_read ON storage.objects
    FOR SELECT
    TO anon_user
    USING (
        split_part(path, '/', 1) = 'shared' AND
        tenant_id = ANY(auth.user_tenant_ids())
    );
