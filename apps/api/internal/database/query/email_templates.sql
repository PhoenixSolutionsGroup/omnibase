-- name: GetEmailTemplateByType :one
SELECT id, type, subject, html_body, created_at, updated_at
FROM email.templates
WHERE type = $1;

-- name: ListEmailTemplates :many
SELECT id, type, subject, html_body, created_at, updated_at
FROM email.templates
ORDER BY type ASC;

-- name: UpsertEmailTemplate :one
INSERT INTO email.templates (type, subject, html_body)
VALUES ($1, $2, $3)
ON CONFLICT (type) DO UPDATE
SET subject = EXCLUDED.subject,
    html_body = EXCLUDED.html_body,
    updated_at = NOW()
RETURNING id, type, subject, html_body, created_at, updated_at;

-- name: DeleteEmailTemplateByType :execrows
DELETE FROM email.templates WHERE type = $1;
