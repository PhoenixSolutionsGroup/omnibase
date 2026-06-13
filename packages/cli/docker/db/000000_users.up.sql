-- Create service users with default schemas
-- These users are used by services connecting through pgbouncer

-- Create schemas first (if not exists)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS permissions;

-- Create auth user with default search_path to auth schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auth') THEN
    CREATE USER auth WITH PASSWORD 'auth';
  END IF;
END
$$;
ALTER USER auth SET search_path TO auth, public;
GRANT ALL PRIVILEGES ON SCHEMA auth TO auth;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO auth;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL PRIVILEGES ON TABLES TO auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL PRIVILEGES ON SEQUENCES TO auth;

-- Create permissions user with default search_path to permissions schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'permissions') THEN
    CREATE USER permissions WITH PASSWORD 'permissions';
  END IF;
END
$$;
ALTER USER permissions SET search_path TO permissions, public;
GRANT ALL PRIVILEGES ON SCHEMA permissions TO permissions;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA permissions TO permissions;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA permissions TO permissions;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT ALL PRIVILEGES ON TABLES TO permissions;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT ALL PRIVILEGES ON SEQUENCES TO permissions;

-- Grant auth user access to read from permissions schema (for permission checks)
GRANT USAGE ON SCHEMA permissions TO auth;
GRANT SELECT ON ALL TABLES IN SCHEMA permissions TO auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT SELECT ON TABLES TO auth;
