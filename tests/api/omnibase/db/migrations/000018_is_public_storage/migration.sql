
ALTER TABLE storage.objects ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_storage_objects_is_public ON storage.objects (is_public) WHERE is_public = TRUE;

CREATE POLICY storage_objects_public_read ON storage.objects
    FOR SELECT TO anon_user
    USING (is_public = TRUE);
