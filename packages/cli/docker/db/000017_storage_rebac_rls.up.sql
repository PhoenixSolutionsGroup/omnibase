-- Migration: storage-rebac-rls
-- Description: Replace path-based storage RLS with ReBAC policies.
--
-- Default policies are minimal — users add more permissive policies for
-- tenant-wide access etc. PostgreSQL permissive policies are OR'd:
-- if ANY policy passes, the row is visible.

-- Drop all old path-based and column-based policies
DROP POLICY IF EXISTS storage_objects_public_read ON storage.objects;
DROP POLICY IF EXISTS storage_objects_public_insert ON storage.objects;
DROP POLICY IF EXISTS storage_objects_user_all ON storage.objects;
DROP POLICY IF EXISTS storage_objects_tenant_read ON storage.objects;

-- INSERT: tenant members can create files (Keto can't check — object doesn't exist yet)
CREATE POLICY storage_objects_insert ON storage.objects
    FOR INSERT TO anon_user
    WITH CHECK (
        tenant_id::text = auth.active_tenant_id()
        AND user_id::text = auth.user_id()
    );

-- SELECT: owner or can_read via Keto (default — minimal)
-- Users can add additional permissive policies for tenant-wide access
-- e.g. auth.has_relation('Tenant', tenant_id::text, 'manage_all')
CREATE POLICY storage_objects_read ON storage.objects
    FOR SELECT TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_read'])
    );

-- DELETE: owner or can_delete via Keto (safety net — Go handler also checks Keto)
CREATE POLICY storage_objects_delete ON storage.objects
    FOR DELETE TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_delete'])
    );
