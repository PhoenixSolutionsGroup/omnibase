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

-- name: UpsertStripeWebhook :one
INSERT INTO stripe.stripe_webhooks (
    stripe_id, url, secret, events, connect
) VALUES (
    $1, $2, $3, $4, $5
)
ON CONFLICT (stripe_id) DO UPDATE
SET url = EXCLUDED.url,
    secret = EXCLUDED.secret,
    events = EXCLUDED.events,
    connect = EXCLUDED.connect,
    updated_at = NOW()
RETURNING id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at;

-- name: DeleteStaleStripeWebhooks :execrows
DELETE FROM stripe.stripe_webhooks
WHERE stripe_id <> ALL(sqlc.arg(keep_stripe_ids)::text[]);

-- name: GetStripeWebhookByStripeID :one
SELECT id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at
FROM stripe.stripe_webhooks
WHERE stripe_id = $1;

-- name: ListStripeWebhooks :many
SELECT id, stripe_id, url, secret, events, connect, config_id, created_at, updated_at
FROM stripe.stripe_webhooks
ORDER BY created_at DESC;

-- name: DeleteStripeWebhookByStripeID :exec
DELETE FROM stripe.stripe_webhooks
WHERE stripe_id = $1;
