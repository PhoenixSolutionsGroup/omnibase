-- New simplified projects table for multi-tier provisioning system

-- Drop existing ENUMs if they exist (CASCADE to handle any dependencies)
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS provisioning_type CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS vps_provider CASCADE;
DROP TYPE IF EXISTS vps_tier CASCADE;
DROP TYPE IF EXISTS vps_status CASCADE;

-- Drop existing tables (CASCADE to handle foreign keys and dependencies)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS vps_hosts CASCADE;

-- Create ENUMs for type safety
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'payg', 'pro', 'enterprise');
CREATE TYPE provisioning_type AS ENUM ('serverless', 'vps_shared', 'vps_dedicated');
CREATE TYPE project_status AS ENUM ('provisioning', 'active', 'suspended', 'failed', 'deleting', 'deleted');
CREATE TYPE vps_provider AS ENUM ('hetzner', 'gcp', 'aws');
CREATE TYPE vps_tier AS ENUM ('shared_free', 'dedicated', 'shared_starter');
CREATE TYPE vps_status AS ENUM ('active', 'full', 'maintenance', 'decommissioned');


-- VPS hosts table (for capacity management)
CREATE TABLE IF NOT EXISTS vps_hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    ssh_port INT DEFAULT 22,
    
    -- Provider info
    provider vps_provider NOT NULL,
    provider_server_id VARCHAR(255) NOT NULL,  -- Provider's server ID (needed for API calls to delete/manage)
    region VARCHAR(100) NOT NULL,
    
    -- Tier
    tier vps_tier NOT NULL,
    
    -- Capacity
    max_tenants INT NOT NULL DEFAULT 200,
    current_tenants INT NOT NULL DEFAULT 0,
    
    -- Resources
    vcpus INT NOT NULL,
    memory_gb INT NOT NULL,
    storage_gb INT NOT NULL,
    
    -- Status
    status vps_status NOT NULL DEFAULT 'active',
    health_check_url TEXT,
    last_health_check TIMESTAMP,

    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Project info
    name VARCHAR(255) NOT NULL,
    project_group_id UUID NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    is_default_branch BOOLEAN NOT NULL DEFAULT FALSE,

    -- Stripe info
    stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),

    -- Neon info
    -- For projects that provision neon, used for usage collection and deprovisioning
    neon_project_id VARCHAR(255),
    
    -- Provisioning type (inferred from tier but stored for easy querying)
    provisioning_type provisioning_type,
    
    -- Database configuration (provider-agnostic)
    database_host VARCHAR(255),
    database_port INT,
    database_name VARCHAR(255),
    database_username VARCHAR(255),
    database_password_encrypted TEXT,  -- Encrypted
    database_connection_string_encrypted TEXT,  -- Encrypted
    
    database_anon_key TEXT,
    database_service_key_encrypted TEXT,  -- Encrypted

    -- Storage configuration (provider-agnostic)
    storage_bucket_name VARCHAR(255),
    
    -- Email configuration
    postmark_server_id VARCHAR(255),
    postmark_server_token_encrypted TEXT,  -- Encrypted
    
    -- Service URLs (public endpoints)
    auth_admin_url TEXT,
    auth_public_url TEXT,
    api_url TEXT,
    postgrest_url TEXT,
    permissions_read_url TEXT,
    permissions_write_url TEXT,
    worker_url TEXT,
    
    -- API Service Key - Used in the Rest API for server to server communication
    api_service_key_encrypted TEXT,  -- Encrypted

    -- VPS configuration (only for vps_shared and vps_dedicated)
    vps_host_id UUID REFERENCES vps_hosts(id),  -- Shared VPS for free tier
    dedicated_vps_id VARCHAR(255),  -- Hetzner/GCP/AWS server ID for dedicated

    -- Status and metadata
    status project_status NOT NULL DEFAULT 'provisioning',
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    suspension_reason VARCHAR(255),
    error_message TEXT,
    
    -- Cloud Run service resource names (e.g., p-{uuid}-api)
    cloud_run_service_resource_names JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN projects.cloud_run_service_resource_names IS 'Array of full Cloud Run service resource names in format: projects/{project}/locations/{region}/services/{name}';

-- Indexes for performance
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_provisioning_type ON projects(provisioning_type);
CREATE INDEX idx_projects_vps_host_id ON projects(vps_host_id) WHERE vps_host_id IS NOT NULL;

CREATE INDEX idx_vps_hosts_status ON vps_hosts(status);
CREATE INDEX idx_vps_hosts_tier_capacity ON vps_hosts(tier, current_tenants, max_tenants) WHERE status = 'active';
CREATE INDEX idx_vps_hosts_provider ON vps_hosts(provider, region);
