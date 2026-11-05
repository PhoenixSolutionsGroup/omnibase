-- name: GetEmailTemplateForTenant :one
SELECT id, type, subject, html_body, tenant_id, created_at, updated_at
FROM email.templates
WHERE type = sqlc.arg(type)
  AND (tenant_id = sqlc.narg(tenant_id) OR tenant_id IS NULL)
ORDER BY tenant_id NULLS LAST
LIMIT 1;

-- name: ListEmailTemplatesForTenant :many
SELECT id, type, subject, html_body, tenant_id, created_at, updated_at
FROM email.templates
WHERE tenant_id = sqlc.narg(tenant_id) OR tenant_id IS NULL
ORDER BY tenant_id NULLS LAST, type ASC;

-- name: UpsertAppEmailTemplate :one
INSERT INTO email.templates (type, subject, html_body)
VALUES (sqlc.arg(type), sqlc.arg(subject), sqlc.arg(html_body))
ON CONFLICT (type) WHERE tenant_id IS NULL DO UPDATE
SET subject = EXCLUDED.subject,
    html_body = EXCLUDED.html_body,
    updated_at = NOW()
RETURNING id, type, subject, html_body, tenant_id, created_at, updated_at;

-- name: UpsertTenantEmailTemplate :one
INSERT INTO email.templates (type, subject, html_body, tenant_id)
VALUES (sqlc.arg(type), sqlc.arg(subject), sqlc.arg(html_body), sqlc.arg(tenant_id))
ON CONFLICT (tenant_id, type) WHERE tenant_id IS NOT NULL DO UPDATE
SET subject = EXCLUDED.subject,
    html_body = EXCLUDED.html_body,
    updated_at = NOW()
RETURNING id, type, subject, html_body, tenant_id, created_at, updated_at;

-- name: DeleteEmailTemplateByType :execrows
DELETE FROM email.templates
WHERE type = sqlc.arg(type) AND tenant_id IS NOT DISTINCT FROM sqlc.narg(tenant_id);

-- name: GetSystemEmailTemplateByName :one
SELECT id, name, subject, html_body, plaintext_body, created_at, updated_at
FROM email.system_templates
WHERE name = $1;

-- name: ListSystemEmailTemplates :many
SELECT id, name, subject, html_body, plaintext_body, created_at, updated_at
FROM email.system_templates
ORDER BY name ASC;

-- name: UpsertSystemEmailTemplate :one
INSERT INTO email.system_templates (name, subject, html_body, plaintext_body)
VALUES ($1, $2, $3, $4)
ON CONFLICT (name) DO UPDATE
SET subject = EXCLUDED.subject,
    html_body = EXCLUDED.html_body,
    plaintext_body = EXCLUDED.plaintext_body,
    updated_at = NOW()
RETURNING id, name, subject, html_body, plaintext_body, created_at, updated_at;

-- name: DeleteSystemEmailTemplateByName :execrows
DELETE FROM email.system_templates WHERE name = $1;
