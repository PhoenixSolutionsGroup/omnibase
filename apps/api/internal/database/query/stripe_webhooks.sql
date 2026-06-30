-- name: CreateStripeWebhook :one
INSERT INTO stripe.stripe_webhooks (
    stripe_id, url, secret, events, connect, config_id
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at;

-- name: UpdateStripeWebhook :exec
UPDATE stripe.stripe_webhooks
SET url = $2,
    events = $3,
    secret = $4
WHERE stripe_id = $1;

-- name: GetStripeWebhookByStripeID :one
SELECT id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at
FROM stripe.stripe_webhooks
WHERE stripe_id = $1;

-- name: ListStripeWebhooks :many
SELECT id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at
FROM stripe.stripe_webhooks
ORDER BY created_at DESC;

-- name: ListStripeWebhooksByConfigID :many
SELECT id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at
FROM stripe.stripe_webhooks
WHERE config_id = $1
ORDER BY created_at DESC;

-- name: DeleteStripeWebhookByStripeID :exec
DELETE FROM stripe.stripe_webhooks
WHERE stripe_id = $1;
