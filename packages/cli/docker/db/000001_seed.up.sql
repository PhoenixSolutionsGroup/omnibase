-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS stripe;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS migrations;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- auth.tenants table
CREATE TABLE auth.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stripe_customer_id TEXT,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- auth.tenant_settings table (for JSONB storage)
CREATE TABLE auth.tenant_settings (
    tenant_id TEXT PRIMARY KEY,
    allow_user_invites BOOLEAN NOT NULL DEFAULT false,
    max_members INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES auth.tenants(id) ON DELETE CASCADE
);

-- auth.tenant_users table
CREATE TABLE auth.tenant_users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id),
    FOREIGN KEY (tenant_id) REFERENCES auth.tenants(id) ON DELETE CASCADE
);

-- auth.tenant_invites table
CREATE TABLE auth.tenant_invites (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    inviter_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES auth.tenants(id) ON DELETE CASCADE
);

-- storage.objects table (path-based storage with user-controlled directory structures)
-- bucket_name stores the project/tenant S3 bucket from config
-- path is user-controlled (e.g., "public/images/avatar.png", "users/123/private/doc.pdf")
-- RLS policies enforce permissions based on path patterns
CREATE TABLE storage.objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_name TEXT NOT NULL, -- Stores project/tenant bucket name from config
    path TEXT NOT NULL,        -- User-controlled full path including directory structure
    tenant_id TEXT REFERENCES auth.tenants(id),
    user_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(bucket_name, path)
);

-- stripe.stripe_configs table
CREATE TABLE stripe.stripe_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config JSONB NOT NULL,
    version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- stripe.stripe_id_mappings table
CREATE TABLE stripe.stripe_id_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL,
    config_item_id TEXT NOT NULL,
    stripe_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (config_id) REFERENCES stripe.stripe_configs(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_tenant_users_tenant_id ON auth.tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON auth.tenant_users(user_id);

CREATE INDEX idx_tenant_invites_tenant_id ON auth.tenant_invites(tenant_id);
CREATE INDEX idx_tenant_invites_email ON auth.tenant_invites(email);
CREATE INDEX idx_tenant_invites_token ON auth.tenant_invites(token);

CREATE INDEX idx_objects_bucket_tenant_path ON storage.objects(bucket_name, tenant_id, path);
CREATE INDEX idx_objects_tenant_id ON storage.objects(tenant_id);
CREATE INDEX idx_objects_user_id ON storage.objects(user_id);
CREATE INDEX idx_objects_path_prefix ON storage.objects(bucket_name, tenant_id, (split_part(path, '/', 1)));

CREATE INDEX idx_stripe_id_mappings_config_id ON stripe.stripe_id_mappings(config_id);
CREATE INDEX idx_stripe_id_mappings_config_item_id ON stripe.stripe_id_mappings(config_item_id);
CREATE INDEX idx_stripe_id_mappings_stripe_id ON stripe.stripe_id_mappings(stripe_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON auth.tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_configs_updated_at BEFORE UPDATE ON stripe.stripe_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_id_mappings_updated_at BEFORE UPDATE ON stripe.stripe_id_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_objects_updated_at BEFORE UPDATE ON storage.objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

