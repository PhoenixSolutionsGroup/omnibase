DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_definer') THEN
    CREATE ROLE rls_definer NOLOGIN BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA permissions TO rls_definer;
GRANT USAGE ON SCHEMA auth TO rls_definer;
GRANT SELECT ON ALL TABLES IN SCHEMA permissions TO rls_definer;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT SELECT ON TABLES TO rls_definer;

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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '';

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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '';

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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '';

ALTER FUNCTION auth.active_user_role() OWNER TO rls_definer;
ALTER FUNCTION auth.has_relation(text, text, text) OWNER TO rls_definer;
ALTER FUNCTION auth.has_any_relation(text, text, text[]) OWNER TO rls_definer;

REVOKE EXECUTE ON FUNCTION auth.active_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION auth.has_relation(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION auth.active_user_role() TO anon_user;
GRANT EXECUTE ON FUNCTION auth.has_relation(text, text, text) TO anon_user;
GRANT EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) TO anon_user;

REVOKE SELECT ON ALL TABLES IN SCHEMA permissions FROM anon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions REVOKE SELECT ON TABLES FROM anon_user;
REVOKE USAGE ON SCHEMA permissions FROM anon_user;
