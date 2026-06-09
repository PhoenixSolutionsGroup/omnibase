-- Migration: rls-permission-helpers
-- Description: Add auth.has_relation() for ReBAC-based RLS policies and
--              replace auth.active_user_role() with DB lookup.
--
-- auth.has_relation() queries Keto relation tuples directly in the database,
-- enabling ReBAC checks in RLS policies. This uses the same source of truth
-- as the API middleware permission checks (keto_service.go / rbac.go).
--
-- auth.active_user_role() is updated to query permissions.roles directly,
-- so role changes take effect immediately without requiring a new JWT.

-- Grant anon_user read access to the permissions schema.
-- The permissions schema is NOT in PGRST_DB_SCHEMAS, so these tables are not
-- directly queryable via PostgREST — they can only be accessed through auth.* functions.
GRANT USAGE ON SCHEMA permissions TO anon_user;
GRANT SELECT ON permissions.roles TO anon_user;

-- Keto creates keto_relation_tuples AFTER our migrations run, so we can't GRANT
-- on it directly. ALTER DEFAULT PRIVILEGES grants SELECT on any future tables
-- created in the permissions schema (by postgres, which is also Keto's DB user).
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT SELECT ON TABLES TO anon_user;

-- Replace auth.active_user_role() to query the database instead of JWT claims.
-- Looks up the user's role_name from permissions.roles using tenant_id + user_id.
CREATE OR REPLACE FUNCTION auth.active_user_role()
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT role_name FROM permissions.roles
        WHERE tenant_id = auth.active_tenant_id()::uuid
          AND auth.user_id()::uuid = ANY(user_ids)
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if the current user has a relation (permission) on a specific resource.
-- Queries Keto relation tuples directly — the same source of truth the API uses.
--
-- Usage in RLS policies:
--   auth.has_relation('Tenant', tenant_id::text, 'delete_tenant')
--   auth.has_relation('Storage', tenant_id::text, 'manage_all')
--   auth.has_relation('Project', project_id::text, 'view')
CREATE OR REPLACE FUNCTION auth.has_relation(
    check_namespace text,
    check_object text,
    check_relation text
) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM permissions.keto_relation_tuples t
        JOIN permissions.keto_uuid_mappings obj_map
          ON t.object = obj_map.id AND obj_map.string_representation = check_object
        JOIN permissions.keto_uuid_mappings sub_map
          ON sub_map.string_representation = auth.user_id()
        WHERE t.namespace = check_namespace
          AND t.relation = check_relation
          AND (
              t.subject_id = sub_map.id
              OR (t.subject_set_namespace = 'User' AND t.subject_set_object = sub_map.id)
          )
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if the current user has ANY of the specified relations on a resource.
-- Single query for multiple relations — more efficient than multiple has_relation() calls.
--
-- Usage in RLS policies:
--   auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_read'])
--   auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_delete'])
CREATE OR REPLACE FUNCTION auth.has_any_relation(
    check_namespace text,
    check_object text,
    check_relations text[]
) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM permissions.keto_relation_tuples t
        JOIN permissions.keto_uuid_mappings obj_map
          ON t.object = obj_map.id AND obj_map.string_representation = check_object
        JOIN permissions.keto_uuid_mappings sub_map
          ON sub_map.string_representation = auth.user_id()
        WHERE t.namespace = check_namespace
          AND t.relation = ANY(check_relations)
          AND (
              t.subject_id = sub_map.id
              OR (t.subject_set_namespace = 'User' AND t.subject_set_object = sub_map.id)
          )
    );
END;
$$ LANGUAGE plpgsql STABLE;
