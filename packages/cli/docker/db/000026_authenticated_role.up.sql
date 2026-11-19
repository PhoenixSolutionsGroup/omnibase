DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOBYPASSRLS;
    END IF;
END $$;

GRANT anon_user TO authenticated;

GRANT USAGE ON SCHEMA public, auth, storage TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

GRANT EXECUTE ON FUNCTION auth.active_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_relation(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) TO authenticated;

DO $$ BEGIN
    GRANT authenticated TO current_user;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping GRANT authenticated to current_user';
END $$;
