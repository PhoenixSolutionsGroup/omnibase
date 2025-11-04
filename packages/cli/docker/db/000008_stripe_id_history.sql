ALTER TABLE stripe.stripe_id_mappings
ADD COLUMN stripe_id_history TEXT[] DEFAULT ARRAY[]::TEXT[];