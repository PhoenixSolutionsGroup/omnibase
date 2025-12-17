-- Create API keys table for tenant-level authentication
CREATE TABLE IF NOT EXISTS auth.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.identities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    scopes JSONB,
    CONSTRAINT unique_key_hash UNIQUE (key_hash)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON auth.api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON auth.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON auth.api_keys(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE auth.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view API keys for their active tenant
CREATE POLICY api_keys_select_policy ON auth.api_keys
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM auth.tenant_users 
            WHERE user_id = auth.user_id() 
            AND is_active = true
        )
    );

-- Policy: Users can insert API keys for their active tenant
CREATE POLICY api_keys_insert_policy ON auth.api_keys
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id 
            FROM auth.tenant_users 
            WHERE user_id = auth.user_id() 
            AND is_active = true
        )
    );

-- Policy: Users can update API keys for their active tenant (for deactivation, last_used_at)
CREATE POLICY api_keys_update_policy ON auth.api_keys
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM auth.tenant_users 
            WHERE user_id = auth.user_id() 
            AND is_active = true
        )
    );

-- Policy: Users can delete API keys for their active tenant
CREATE POLICY api_keys_delete_policy ON auth.api_keys
    FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM auth.tenant_users 
            WHERE user_id = auth.user_id() 
            AND is_active = true
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.api_keys TO anon_user;
