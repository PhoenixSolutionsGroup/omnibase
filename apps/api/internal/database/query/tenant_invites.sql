-- name: CreateTenantInvite :one
INSERT INTO auth.tenant_invites (id, tenant_id, email, role, token, inviter_id, expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, tenant_id, email, role, token, inviter_id, expires_at, used_at, created_at;

-- name: GetActiveInviteByToken :one
SELECT id, tenant_id, email, role, token, inviter_id, expires_at, used_at, created_at
FROM auth.tenant_invites
WHERE token = $1 AND used_at IS NULL AND expires_at > NOW();

-- name: MarkInviteUsed :exec
UPDATE auth.tenant_invites
SET used_at = NOW()
WHERE id = $1;
