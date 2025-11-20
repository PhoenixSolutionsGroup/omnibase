-- Add NOT NULL constraints to columns with DEFAULT values that should never be NULL

-- Fix permissions.roles table
ALTER TABLE permissions.roles
ALTER COLUMN user_ids SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- Fix permissions.definitions table
ALTER TABLE permissions.definitions
ALTER COLUMN updated_at SET NOT NULL;

-- Fix stripe.stripe_id_mappings table
ALTER TABLE stripe.stripe_id_mappings
ALTER COLUMN stripe_id_history SET NOT NULL;