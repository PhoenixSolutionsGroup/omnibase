-- Migration: webhook_registrations
-- Created: 2026-01-02T10:02:38.808Z

-- Webhook registrations for managed hosting
-- Stores client webhook configurations for event forwarding
CREATE TABLE IF NOT EXISTS webhook_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    webhook_id VARCHAR(255) NOT NULL,
    callback_url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    connect BOOLEAN NOT NULL DEFAULT false,
    pseudo_id VARCHAR(255) NOT NULL UNIQUE,
    secret TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_tenant ON webhook_registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_account ON webhook_registrations(account_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_active ON webhook_registrations(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_pseudo_id ON webhook_registrations(pseudo_id);

COMMENT ON TABLE webhook_registrations IS 'Stores webhook configurations for managed hosting clients';
COMMENT ON COLUMN webhook_registrations.tenant_id IS 'The tenant/project this webhook belongs to';
COMMENT ON COLUMN webhook_registrations.account_id IS 'Stripe Connect account ID (acct_xxx)';
COMMENT ON COLUMN webhook_registrations.webhook_id IS 'User-provided webhook identifier from config';
COMMENT ON COLUMN webhook_registrations.callback_url IS 'URL to forward webhook events to';
COMMENT ON COLUMN webhook_registrations.events IS 'Array of Stripe event types to forward';
COMMENT ON COLUMN webhook_registrations.connect IS 'If true, listen to connected account events';
COMMENT ON COLUMN webhook_registrations.pseudo_id IS 'Generated ID returned to client (wh_managed_xxx)';
COMMENT ON COLUMN webhook_registrations.secret IS 'Generated signing secret for client verification';
COMMENT ON COLUMN webhook_registrations.active IS 'Soft delete flag';
