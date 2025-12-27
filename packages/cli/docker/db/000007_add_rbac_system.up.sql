-- Permissions schema
CREATE SCHEMA IF NOT EXISTS permissions;

-- Role definitions table
CREATE TABLE permissions.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  role_name TEXT NOT NULL,
  permissions TEXT[] NOT NULL,
  user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, role_name)
);

-- Namespace definitions table (parsed from Keto .ts files)
CREATE TABLE permissions.definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace TEXT UNIQUE NOT NULL,
  relations TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_roles_tenant ON permissions.roles(tenant_id);
CREATE INDEX idx_roles_lookup ON permissions.roles(tenant_id, role_name);
CREATE INDEX idx_roles_users ON permissions.roles USING GIN(user_ids);

-- Seed default roles (tenant_id NULL = system roles)
INSERT INTO permissions.roles (tenant_id, role_name, permissions) VALUES
  (NULL, 'owner', ARRAY['tenant#delete_tenant', 'tenant#invite_user', 'tenant#remove_user', 'tenant#update_user_role']),
  (NULL, 'admin', ARRAY['tenant#invite_user', 'tenant#remove_user', 'tenant#update_user_role']),
  (NULL, 'member', ARRAY[]::TEXT[]);