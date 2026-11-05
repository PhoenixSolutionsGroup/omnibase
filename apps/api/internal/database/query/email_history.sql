-- name: CountRecentEmailSends :one
SELECT COUNT(*)
FROM email.history
WHERE tenant_id = sqlc.arg(tenant_id)
  AND created_at > NOW() - make_interval(secs => sqlc.arg(window_seconds)::double precision);

-- name: RecordEmailSend :one
INSERT INTO email.history (
    tenant_id,
    to_email,
    subject,
    html_body,
    plaintext_body,
    template_type,
    template_data
)
VALUES (
    sqlc.narg(tenant_id),
    sqlc.arg(to_email),
    sqlc.arg(subject),
    sqlc.arg(html_body),
    sqlc.arg(plaintext_body),
    sqlc.narg(template_type),
    sqlc.narg(template_data)
)
RETURNING id, tenant_id, to_email, subject, html_body, plaintext_body, template_type, template_data, provider_message_id, created_at;
