-- Add connect column to stripe_webhooks for Stripe Connect webhook support
ALTER TABLE stripe.stripe_webhooks
ADD COLUMN connect BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN stripe.stripe_webhooks.connect IS 'If true, webhook listens to events from connected accounts (Stripe Connect)';
