DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        ALTER EXTENSION pg_trgm SET SCHEMA public;
    END IF;
END $$;
