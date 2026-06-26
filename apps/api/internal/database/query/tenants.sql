-- name: GetTenantByID :one
SELECT id, name, stripe_customer_id, enterprise_template, enterprise_id, type, created_at, updated_at
FROM auth.tenants
WHERE id = $1;

-- name: GetTenantByStripeCustomerID :one
SELECT id, name, stripe_customer_id, enterprise_template, enterprise_id, type, created_at, updated_at
FROM auth.tenants
WHERE stripe_customer_id = $1;
