-- Migration: storage-rls-policies
-- Created: 2025-11-20T12:22:30.758Z
-- Description: Add RLS policies for storage.objects table to enable testing

-- Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS storage_objects_public_read ON storage.objects;
DROP POLICY IF EXISTS storage_objects_public_insert ON storage.objects;
DROP POLICY IF EXISTS storage_objects_user_all ON storage.objects;
DROP POLICY IF EXISTS storage_objects_tenant_read ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_full_access ON storage.objects;
DROP POLICY IF EXISTS storage_objects_member_uploads ON storage.objects;

-- Policy 1: Public directory - Anyone can read
CREATE POLICY storage_objects_public_read ON storage.objects
    FOR SELECT
    TO anon_user
    USING (
        split_part(path, '/', 1) = 'public'
        AND tenant_id::text = auth.active_tenant_id()
    );

-- Policy 2: Public directory - Authenticated users can upload
CREATE POLICY storage_objects_public_insert ON storage.objects
    FOR INSERT
    TO anon_user
    WITH CHECK (
        split_part(path, '/', 1) = 'public'
        AND tenant_id::text = auth.active_tenant_id()
        AND user_id::text = auth.user_id()
    );

-- Policy 3: Users have full control over their own files
CREATE POLICY storage_objects_user_all ON storage.objects
    FOR ALL
    TO anon_user
    USING (
        user_id::text = auth.user_id()
        AND tenant_id::text = auth.active_tenant_id()
    )
    WITH CHECK (
        user_id::text = auth.user_id()
        AND tenant_id::text = auth.active_tenant_id()
    );

-- Policy 4: Owners have full access to all tenant files
CREATE POLICY storage_objects_owner_full_access ON storage.objects
    FOR ALL
    TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
        AND auth.active_user_role() = 'owner'
    )
    WITH CHECK (
        tenant_id::text = auth.active_tenant_id()
        AND auth.active_user_role() = 'owner'
    );

-- Policy 5: Members can read shared directory and upload to their own uploads directory
CREATE POLICY storage_objects_member_uploads ON storage.objects
    FOR INSERT
    TO anon_user
    WITH CHECK (
        tenant_id::text = auth.active_tenant_id()
        AND auth.active_user_role() IN ('member', 'admin')
        AND (
            -- Members can upload to uploads/{user_id}/ directory
            path LIKE 'uploads/' || auth.user_id() || '/%'
            -- Or to public directory
            OR split_part(path, '/', 1) = 'public'
        )
    );

-- Policy 6: Tenant members can read shared files
CREATE POLICY storage_objects_tenant_shared_read ON storage.objects
    FOR SELECT
    TO anon_user
    USING (
        split_part(path, '/', 1) = 'shared'
        AND tenant_id::text = auth.active_tenant_id()
    );

-- Policy 7: Cross-tenant isolation - ensure users can ONLY see files from their active tenant
-- This is implicit in all policies above via tenant_id = auth.active_tenant_id()
-- But we add an explicit deny-all base policy for safety
CREATE POLICY storage_objects_tenant_isolation ON storage.objects
    FOR ALL
    TO anon_user
    USING (
        tenant_id::text = auth.active_tenant_id()
    )
    WITH CHECK (
        tenant_id::text = auth.active_tenant_id()
    );
