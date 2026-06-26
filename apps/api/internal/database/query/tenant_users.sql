-- name: ListTenantUsersByTenant :many
SELECT id, tenant_id, user_id, role, is_active, joined_at
FROM auth.tenant_users
WHERE tenant_id = $1
ORDER BY joined_at DESC;

-- name: GetTenantUser :one
SELECT id, tenant_id, user_id, role, is_active, joined_at
FROM auth.tenant_users
WHERE tenant_id = $1 AND user_id = $2;

-- name: ListTenantUsersByUser :many
SELECT id, tenant_id, user_id, role, is_active, joined_at
FROM auth.tenant_users
WHERE user_id = $1
ORDER BY joined_at ASC;

-- name: CountOwnersByTenant :one
SELECT COUNT(*) FROM auth.tenant_users
WHERE tenant_id = $1 AND role = 'owner';

-- name: UpdateTenantUserRole :exec
UPDATE auth.tenant_users
SET role = $3
WHERE tenant_id = $1 AND user_id = $2;

-- name: DeleteTenantUser :exec
DELETE FROM auth.tenant_users
WHERE tenant_id = $1 AND user_id = $2;

-- name: DeactivateAllUserTenants :exec
UPDATE auth.tenant_users
SET is_active = false
WHERE user_id = $1;

-- name: ActivateUserTenant :exec
UPDATE auth.tenant_users
SET is_active = true
WHERE user_id = $1 AND tenant_id = $2;

-- name: CreateTenantUser :one
INSERT INTO auth.tenant_users (id, tenant_id, user_id, role, is_active)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, tenant_id, user_id, role, is_active, joined_at;
