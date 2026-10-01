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

ALTER FUNCTION auth.active_user_role() OWNER TO CURRENT_USER;
ALTER FUNCTION auth.has_relation(text, text, text) OWNER TO CURRENT_USER;
ALTER FUNCTION auth.has_any_relation(text, text, text[]) OWNER TO CURRENT_USER;

GRANT EXECUTE ON FUNCTION auth.active_user_role() TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.has_relation(text, text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) TO PUBLIC;

REVOKE EXECUTE ON FUNCTION auth.active_user_role() FROM anon_user;
REVOKE EXECUTE ON FUNCTION auth.has_relation(text, text, text) FROM anon_user;
REVOKE EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) FROM anon_user;

GRANT USAGE ON SCHEMA permissions TO anon_user;
GRANT SELECT ON ALL TABLES IN SCHEMA permissions TO anon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT SELECT ON TABLES TO anon_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA permissions REVOKE SELECT ON TABLES FROM rls_definer;
DROP OWNED BY rls_definer;
DROP ROLE IF EXISTS rls_definer;
