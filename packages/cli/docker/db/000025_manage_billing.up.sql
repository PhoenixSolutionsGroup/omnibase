UPDATE permissions.role_templates
SET permissions = array_append(permissions, 'tenant#manage_billing'),
    updated_at = NOW()
WHERE role_name = 'owner'
  AND NOT ('tenant#manage_billing' = ANY(permissions));
