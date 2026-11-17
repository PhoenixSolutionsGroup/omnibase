UPDATE permissions.role_templates
SET permissions = array_remove(permissions, 'tenant#manage_billing'),
    updated_at = NOW()
WHERE 'tenant#manage_billing' = ANY(permissions);
