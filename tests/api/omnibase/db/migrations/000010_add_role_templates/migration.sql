-- Create role templates table (source of truth for system roles)
CREATE TABLE permissions.role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT UNIQUE NOT NULL,
  permissions TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing system roles (tenant_id IS NULL) to role_templates
INSERT INTO permissions.role_templates (role_name, permissions, description)
SELECT role_name, permissions, 'System role' 
FROM permissions.roles 
WHERE tenant_id IS NULL;

-- Delete system roles from roles table (will be recreated per-tenant)
DELETE FROM permissions.roles WHERE tenant_id IS NULL;

-- Add template_id column to roles table
ALTER TABLE permissions.roles 
  ADD COLUMN template_id UUID REFERENCES permissions.role_templates(id);

-- Make tenant_id NOT NULL (all roles must belong to a tenant)
ALTER TABLE permissions.roles 
  ALTER COLUMN tenant_id SET NOT NULL;

-- Add index for template_id
CREATE INDEX idx_roles_template ON permissions.roles(template_id);
