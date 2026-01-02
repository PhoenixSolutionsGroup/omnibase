-- stripe.stripe_webhooks table for storing webhook endpoint configuration
CREATE TABLE stripe.stripe_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_id TEXT NOT NULL,              -- Stripe webhook endpoint ID (we_xxx)
    url TEXT NOT NULL,                    -- Webhook endpoint URL
    secret TEXT NOT NULL,                 -- Webhook signing secret (whsec_xxx)
    events TEXT[] NOT NULL DEFAULT '{}',  -- Array of subscribed event types
    config_id UUID,                       -- Link to StripeConfig (optional)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (config_id) REFERENCES stripe.stripe_configs(id) ON DELETE SET NULL
);

-- Indexes for webhook lookups
CREATE UNIQUE INDEX idx_stripe_webhooks_stripe_id ON stripe.stripe_webhooks(stripe_id);
CREATE INDEX idx_stripe_webhooks_url ON stripe.stripe_webhooks(url);
CREATE INDEX idx_stripe_webhooks_config_id ON stripe.stripe_webhooks(config_id);

-- Trigger for updated_at
CREATE TRIGGER update_stripe_webhooks_updated_at BEFORE UPDATE ON stripe.stripe_webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
