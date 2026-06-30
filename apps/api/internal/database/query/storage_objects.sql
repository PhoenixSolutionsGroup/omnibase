-- name: CreateStorageObject :one
INSERT INTO storage.objects (bucket_name, path, tenant_id, user_id, metadata)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, bucket_name, path, tenant_id, user_id, metadata, is_public, created_at, updated_at;

-- name: GetStorageObjectByPath :one
SELECT id, bucket_name, path, tenant_id, user_id, metadata, is_public, created_at, updated_at
FROM storage.objects
WHERE bucket_name = $1 AND path = $2 AND tenant_id = $3;

-- name: GetPublicStorageObjectByPath :one
SELECT id, bucket_name, path, tenant_id, user_id, metadata, is_public, created_at, updated_at
FROM storage.objects
WHERE bucket_name = $1 AND path = $2 AND is_public = true
LIMIT 1;

-- name: DeleteStorageObjectByID :exec
DELETE FROM storage.objects WHERE id = $1;

-- name: MarkStorageObjectPublic :exec
UPDATE storage.objects SET is_public = true, updated_at = NOW() WHERE id = $1;
