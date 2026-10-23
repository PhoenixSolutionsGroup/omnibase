CREATE TABLE email.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES auth.tenants(id) ON DELETE CASCADE,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    plaintext_body TEXT NOT NULL DEFAULT '',
    template_type TEXT,
    template_data JSONB,
    provider_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_history_tenant_created_at
    ON email.history (tenant_id, created_at DESC);
