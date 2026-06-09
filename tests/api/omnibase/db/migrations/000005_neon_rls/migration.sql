-- Grant roles to current user (required for Neon and managed Postgres services)
-- This allows the current user to SET ROLE to anon_user/super_user for PostgREST
-- Uses exception handling for environments where roles are pre-configured by admin
DO $$
BEGIN
    BEGIN
        GRANT anon_user TO current_user;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Skipping GRANT anon_user - insufficient permissions (already configured)';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not grant anon_user: % (%)', SQLERRM, SQLSTATE;
    END;

    BEGIN
        GRANT super_user TO current_user;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Skipping GRANT super_user - insufficient permissions (already configured)';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not grant super_user: % (%)', SQLERRM, SQLSTATE;
    END;
END $$;
