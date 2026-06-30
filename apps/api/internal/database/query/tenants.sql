-- name: GetTenantByID :one
SELECT id, name, stripe_customer_id, enterprise_template, enterprise_id, type, created_at, updated_at
FROM auth.tenants
WHERE id = $1;

-- name: GetTenantByStripeCustomerID :one
SELECT id, name, stripe_customer_id, enterprise_template, enterprise_id, type, created_at, updated_at
FROM auth.tenants
WHERE stripe_customer_id = $1;

-- name: CreateTenant :one
INSERT INTO auth.tenants (id, name, stripe_customer_id, type)
VALUES ($1, $2, $3, $4)
RETURNING id, name, stripe_customer_id, enterprise_template, enterprise_id, type, created_at, updated_at;

-- name: CreateTenantSettings :exec
INSERT INTO auth.tenant_settings (tenant_id, allow_user_invites, max_members)
VALUES ($1, $2, $3);

-- name: DeleteTenant :exec
DELETE FROM auth.tenants WHERE id = $1;

-- name: UpdateTenantEnterpriseTemplate :exec
UPDATE auth.tenants SET enterprise_template = $2 WHERE id = $1;

-- name: UpdateTenantEnterpriseID :exec
UPDATE auth.tenants SET enterprise_id = $2 WHERE id = $1;
