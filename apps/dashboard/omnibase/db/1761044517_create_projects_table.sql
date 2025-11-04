CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Neon Database
    neon_project_id VARCHAR(255),
    database_host VARCHAR(255),
    database_name VARCHAR(255),
    database_username VARCHAR(255),
    database_port VARCHAR(10),
    
    -- R2 Storage
    r2_bucket_name VARCHAR(255),
    
    -- Stripe
    stripe_customer_id VARCHAR(255),
    
    -- Resend
    resend_domain_id VARCHAR(255),
    
    -- Service URLs
    auth_public_url TEXT,
    auth_admin_url TEXT,
    keto_read_url TEXT,
    keto_write_url TEXT,
    postgrest_url TEXT,
    type_gen_url TEXT,
    api_url TEXT,
    
    -- Service Names (for cleanup)
    cloud_run_service_names TEXT[]
);
