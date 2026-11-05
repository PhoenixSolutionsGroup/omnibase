ALTER TABLE email.templates
    ADD COLUMN tenant_id TEXT REFERENCES auth.tenants(id) ON DELETE CASCADE;

ALTER TABLE email.templates
    DROP CONSTRAINT IF EXISTS templates_type_key;

CREATE UNIQUE INDEX email_templates_appwide_type_key
    ON email.templates (type) WHERE tenant_id IS NULL;

CREATE UNIQUE INDEX email_templates_tenant_type_key
    ON email.templates (tenant_id, type) WHERE tenant_id IS NOT NULL;

CREATE TABLE email.system_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    plaintext_body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_system_templates_updated_at BEFORE UPDATE ON email.system_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

UPDATE permissions.role_templates
SET permissions = array_append(permissions, 'tenant#send_email'),
    updated_at = NOW()
WHERE role_name IN ('owner', 'admin')
  AND NOT ('tenant#send_email' = ANY(permissions));

UPDATE permissions.role_templates
SET permissions = array_append(permissions, 'tenant#manage_email_templates'),
    updated_at = NOW()
WHERE role_name IN ('owner', 'admin')
  AND NOT ('tenant#manage_email_templates' = ANY(permissions));

UPDATE permissions.roles
SET permissions = array_append(permissions, 'tenant#send_email'),
    updated_at = NOW()
WHERE role_name IN ('owner', 'admin')
  AND NOT ('tenant#send_email' = ANY(permissions));

UPDATE permissions.roles
SET permissions = array_append(permissions, 'tenant#manage_email_templates'),
    updated_at = NOW()
WHERE role_name IN ('owner', 'admin')
  AND NOT ('tenant#manage_email_templates' = ANY(permissions));
