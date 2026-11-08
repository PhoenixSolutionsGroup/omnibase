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

ALTER FUNCTION auth.has_relation(text, text, text) OWNER TO rls_definer;
ALTER FUNCTION auth.has_any_relation(text, text, text[]) OWNER TO rls_definer;
REVOKE EXECUTE ON FUNCTION auth.has_relation(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth.has_relation(text, text, text) TO anon_user;
GRANT EXECUTE ON FUNCTION auth.has_any_relation(text, text, text[]) TO anon_user;

DROP POLICY IF EXISTS storage_objects_read ON storage.objects;
CREATE POLICY storage_objects_read ON storage.objects
    FOR SELECT TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_read'])
    );

DROP POLICY IF EXISTS storage_objects_delete ON storage.objects;
CREATE POLICY storage_objects_delete ON storage.objects
    FOR DELETE TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_delete'])
    );

DROP FUNCTION IF EXISTS permissions.can(text, text, text);
DROP FUNCTION IF EXISTS permissions.allowed_ids(text, text);
DROP FUNCTION IF EXISTS permissions.allowed_objects(text, text);
DROP FUNCTION IF EXISTS permissions.ensure_keto_uuid();
DROP FUNCTION IF EXISTS permissions.keto_uuid(text);
DROP TABLE IF EXISTS permissions.permit_expandable;
DROP TABLE IF EXISTS permissions.permit_rules;
REVOKE USAGE ON SCHEMA permissions FROM anon_user;
