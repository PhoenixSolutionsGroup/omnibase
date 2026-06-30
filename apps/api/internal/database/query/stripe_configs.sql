-- name: GetLatestStripeConfig :one
SELECT id, config, version, created_at, updated_at
FROM stripe.stripe_configs
ORDER BY created_at DESC
LIMIT 1;

-- name: CreateStripeConfig :one
INSERT INTO stripe.stripe_configs (
    config, version
) VALUES (
    $1, $2
)
RETURNING id, config, version, created_at, updated_at;

-- name: ListStripeConfigs :many
SELECT id, config, version, created_at, updated_at
FROM stripe.stripe_configs
ORDER BY created_at DESC;

-- name: ListStripeConfigsPaginated :many
SELECT id, config, version, created_at, updated_at
FROM stripe.stripe_configs
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountStripeConfigs :one
SELECT COUNT(*) FROM stripe.stripe_configs;
