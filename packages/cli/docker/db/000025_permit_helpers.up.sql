CREATE TABLE IF NOT EXISTS auth.permit_rules (
    namespace  text NOT NULL,
    permit     text NOT NULL,
    kind       text NOT NULL CHECK (kind IN ('relation', 'permit', 'traverse')),
    source     text NOT NULL,
    via_permit text,
    PRIMARY KEY (namespace, permit, kind, source),
    CHECK ((kind = 'traverse') = (via_permit IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS permit_rules_source_idx ON auth.permit_rules (namespace, source) WHERE kind <> 'traverse';
CREATE INDEX IF NOT EXISTS permit_rules_traverse_idx ON auth.permit_rules (via_permit) WHERE kind = 'traverse';

GRANT SELECT ON auth.permit_rules TO rls_definer;

INSERT INTO auth.permit_rules (namespace, permit, kind, source, via_permit) VALUES
    ('StorageObject', 'read',        'relation', 'owner',           NULL),
    ('StorageObject', 'read',        'relation', 'can_read',        NULL),
    ('StorageObject', 'delete',      'relation', 'owner',           NULL),
    ('StorageObject', 'delete',      'relation', 'can_delete',      NULL),
    ('StorageObject', 'make_public', 'relation', 'owner',           NULL),
    ('StorageObject', 'make_public', 'relation', 'can_make_public', NULL)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION auth.allowed_ids(check_namespace text, check_permit text)
RETURNS SETOF text AS $$
DECLARE
    net uuid;
    subject uuid;
BEGIN
    IF auth.user_id() IS NULL THEN
        RETURN;
    END IF;
    SELECT id INTO net FROM permissions.networks ORDER BY created_at LIMIT 1;
    IF net IS NULL THEN
        RETURN;
    END IF;
    subject := public.uuid_generate_v5(net, auth.user_id());

    RETURN QUERY
    WITH RECURSIVE reach(ns, obj, rel) AS (
        SELECT t.namespace::text, t.object, t.relation::text
        FROM permissions.keto_relation_tuples t
        WHERE t.nid = net
          AND t.subject_id = subject
          AND t.subject_set_namespace IS NULL
          AND t.subject_set_object IS NULL
          AND t.subject_set_relation IS NULL
    UNION
        SELECT x.ns, x.obj, x.rel
        FROM reach p
        CROSS JOIN LATERAL (
            SELECT t.namespace::text AS ns, t.object AS obj, t.relation::text AS rel
            FROM permissions.keto_relation_tuples t
            WHERE t.nid = net
              AND t.subject_id IS NULL
              AND t.subject_set_namespace = p.ns
              AND t.subject_set_object = p.obj
              AND t.subject_set_relation = p.rel
            UNION ALL
            SELECT p.ns, p.obj, r.permit
            FROM auth.permit_rules r
            WHERE r.namespace = p.ns
              AND r.source = p.rel
              AND r.kind <> 'traverse'
            UNION ALL
            SELECT t.namespace::text, t.object, r.permit
            FROM auth.permit_rules r
            JOIN permissions.keto_relation_tuples t
              ON t.nid = net
             AND t.subject_id IS NULL
             AND t.subject_set_namespace = p.ns
             AND t.subject_set_object = p.obj
             AND t.subject_set_relation = ''
             AND t.namespace = r.namespace
             AND t.relation = r.source
            WHERE r.kind = 'traverse'
              AND r.via_permit = p.rel
        ) x
    )
    SELECT m.string_representation
    FROM reach
    JOIN permissions.keto_uuid_mappings m ON m.id = reach.obj
    WHERE reach.ns = check_namespace
      AND reach.rel = check_permit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '';

CREATE OR REPLACE FUNCTION auth.can(check_namespace text, check_object text, check_permit text)
RETURNS boolean AS $$
DECLARE
    net uuid;
    subject uuid;
BEGIN
    IF auth.user_id() IS NULL OR check_object IS NULL THEN
        RETURN false;
    END IF;
    SELECT id INTO net FROM permissions.networks ORDER BY created_at LIMIT 1;
    IF net IS NULL THEN
        RETURN false;
    END IF;
    subject := public.uuid_generate_v5(net, auth.user_id());

    RETURN EXISTS (
        WITH RECURSIVE need(ns, obj, rel) AS (
            SELECT check_namespace, public.uuid_generate_v5(net, check_object), check_permit
        UNION
            SELECT x.ns, x.obj, x.rel
            FROM need n
            CROSS JOIN LATERAL (
                SELECT n.ns AS ns, n.obj AS obj, r.source AS rel
                FROM auth.permit_rules r
                WHERE r.namespace = n.ns
                  AND r.permit = n.rel
                  AND r.kind <> 'traverse'
                UNION ALL
                SELECT t.subject_set_namespace::text, t.subject_set_object, r.via_permit
                FROM auth.permit_rules r
                JOIN permissions.keto_relation_tuples t
                  ON t.nid = net
                 AND t.namespace = n.ns
                 AND t.object = n.obj
                 AND t.relation = r.source
                 AND t.subject_id IS NULL
                 AND t.subject_set_relation = ''
                WHERE r.namespace = n.ns
                  AND r.permit = n.rel
                  AND r.kind = 'traverse'
                UNION ALL
                SELECT t.subject_set_namespace::text, t.subject_set_object, t.subject_set_relation::text
                FROM permissions.keto_relation_tuples t
                WHERE t.nid = net
                  AND t.namespace = n.ns
                  AND t.object = n.obj
                  AND t.relation = n.rel
                  AND t.subject_id IS NULL
                  AND t.subject_set_relation <> ''
            ) x
        )
        SELECT 1
        FROM need n
        JOIN permissions.keto_relation_tuples t
          ON t.nid = net
         AND t.namespace = n.ns
         AND t.object = n.obj
         AND t.relation = n.rel
         AND t.subject_id = subject
         AND t.subject_set_namespace IS NULL
         AND t.subject_set_object IS NULL
         AND t.subject_set_relation IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO '';

ALTER FUNCTION auth.allowed_ids(text, text) OWNER TO rls_definer;
ALTER FUNCTION auth.can(text, text, text) OWNER TO rls_definer;
REVOKE EXECUTE ON FUNCTION auth.allowed_ids(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION auth.can(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth.allowed_ids(text, text) TO anon_user;
GRANT EXECUTE ON FUNCTION auth.can(text, text, text) TO anon_user;

DROP POLICY IF EXISTS storage_objects_read ON storage.objects;
CREATE POLICY storage_objects_read ON storage.objects
    FOR SELECT TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND id::text IN (SELECT auth.allowed_ids('StorageObject', 'read'))
    );

DROP POLICY IF EXISTS storage_objects_delete ON storage.objects;
CREATE POLICY storage_objects_delete ON storage.objects
    FOR DELETE TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND id::text IN (SELECT auth.allowed_ids('StorageObject', 'delete'))
    );

DROP FUNCTION IF EXISTS auth.has_relation(text, text, text);
DROP FUNCTION IF EXISTS auth.has_any_relation(text, text, text[]);
