-- name: GetMappingByConfigItemID :one
SELECT id, config_id, config_item_id, stripe_id, item_type, stripe_id_history, created_at, updated_at
FROM stripe.stripe_id_mappings
WHERE config_item_id = $1 AND item_type = $2
ORDER BY created_at DESC
LIMIT 1;

-- name: GetMappingByStripeID :one
SELECT id, config_id, config_item_id, stripe_id, item_type, stripe_id_history, created_at, updated_at
FROM stripe.stripe_id_mappings
WHERE stripe_id = $1 OR $1 = ANY(stripe_id_history)
ORDER BY (stripe_id = $1) DESC, created_at DESC
LIMIT 1;

-- name: CreateMapping :one
INSERT INTO stripe.stripe_id_mappings (
    config_id, config_item_id, stripe_id, item_type, stripe_id_history
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING id, config_id, config_item_id, stripe_id, item_type, stripe_id_history, created_at, updated_at;

-- name: UpdateMappingStripeID :exec
UPDATE stripe.stripe_id_mappings
SET stripe_id = $2,
    stripe_id_history = $3,
    config_id = $4
WHERE config_item_id = $1 AND item_type = $5;
