-- name: GetEmailTemplateByType :one
SELECT id, type, subject, html_body, created_at, updated_at
FROM email.templates
WHERE type = $1;
