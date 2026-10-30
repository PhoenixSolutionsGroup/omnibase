CREATE TABLE stripe.stripe_id_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL,
    config_item_id TEXT NOT NULL,
    stripe_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    stripe_id_history TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (config_id) REFERENCES stripe.stripe_configs(id) ON DELETE CASCADE
);

CREATE INDEX idx_stripe_id_mappings_config_id ON stripe.stripe_id_mappings(config_id);
CREATE INDEX idx_stripe_id_mappings_config_item_id ON stripe.stripe_id_mappings(config_item_id);
CREATE INDEX idx_stripe_id_mappings_stripe_id ON stripe.stripe_id_mappings(stripe_id);

CREATE TRIGGER update_stripe_id_mappings_updated_at BEFORE UPDATE ON stripe.stripe_id_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
