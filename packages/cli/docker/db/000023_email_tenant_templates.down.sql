DROP TABLE IF EXISTS email.system_templates;

DROP INDEX IF EXISTS email.email_templates_tenant_type_key;
DROP INDEX IF EXISTS email.email_templates_appwide_type_key;

ALTER TABLE email.templates
    DROP COLUMN IF EXISTS tenant_id;

ALTER TABLE email.templates
    ADD CONSTRAINT templates_type_key UNIQUE (type);

UPDATE permissions.role_templates
SET permissions = array_remove(permissions, 'tenant#send_email'),
    updated_at = NOW()
WHERE 'tenant#send_email' = ANY(permissions);

UPDATE permissions.role_templates
SET permissions = array_remove(permissions, 'tenant#manage_email_templates'),
    updated_at = NOW()
WHERE 'tenant#manage_email_templates' = ANY(permissions);

UPDATE permissions.roles
SET permissions = array_remove(permissions, 'tenant#send_email'),
    updated_at = NOW()
WHERE 'tenant#send_email' = ANY(permissions);

UPDATE permissions.roles
SET permissions = array_remove(permissions, 'tenant#manage_email_templates'),
    updated_at = NOW()
WHERE 'tenant#manage_email_templates' = ANY(permissions);
