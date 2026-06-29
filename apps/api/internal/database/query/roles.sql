-- name: ListRolesByTenant :many
SELECT id, tenant_id, role_name, permissions, template_id, user_ids, created_at, updated_at
FROM permissions.roles
WHERE tenant_id = $1
ORDER BY role_name;

-- name: GetRoleByIDAndTenant :one
SELECT id, tenant_id, role_name, permissions, template_id, user_ids, created_at, updated_at
FROM permissions.roles
WHERE id = $1 AND tenant_id = $2;

-- name: CreateRole :one
INSERT INTO permissions.roles (tenant_id, role_name, permissions, template_id, user_ids)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, tenant_id, role_name, permissions, template_id, user_ids, created_at, updated_at;

-- name: UpdateRolePermissions :one
UPDATE permissions.roles
SET permissions = $1, updated_at = NOW()
WHERE id = $2 AND tenant_id = $3
RETURNING id, tenant_id, role_name, permissions, template_id, user_ids, created_at, updated_at;

-- name: DeleteRoleByIDAndTenant :exec
DELETE FROM permissions.roles
WHERE id = $1 AND tenant_id = $2;

-- name: GetRoleByNameAndTenant :one
SELECT r.id, r.tenant_id, r.role_name, r.permissions, r.template_id, r.user_ids, r.created_at, r.updated_at,
       t.permissions::text[] AS template_permissions
FROM permissions.roles r
LEFT JOIN permissions.role_templates t ON r.template_id = t.id
WHERE r.role_name = $1 AND r.tenant_id = $2;

-- name: AddUserToRole :exec
UPDATE permissions.roles
SET user_ids = array_append(user_ids, sqlc.arg(user_id)::uuid), updated_at = NOW()
WHERE id = sqlc.arg(role_id) AND tenant_id = sqlc.arg(tenant_id);

-- name: RemoveUserFromRole :exec
UPDATE permissions.roles
SET user_ids = array_remove(user_ids, sqlc.arg(user_id)::uuid), updated_at = NOW()
WHERE id = sqlc.arg(role_id) AND tenant_id = sqlc.arg(tenant_id);

-- name: ListNamespaceDefinitions :many
SELECT id, namespace, relations, subject_relations, updated_at
FROM permissions.definitions
ORDER BY namespace;

-- name: ListRoleTemplates :many
SELECT id, role_name, permissions, description, created_at, updated_at
FROM permissions.role_templates
ORDER BY role_name;
