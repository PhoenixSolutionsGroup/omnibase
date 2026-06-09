-- Create email schema
CREATE SCHEMA IF NOT EXISTS email;

-- Email templates table
CREATE TABLE email.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by type
CREATE INDEX idx_email_templates_type ON email.templates(type);

-- Trigger for updated_at timestamp
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed the tenant-user-invite template
INSERT INTO email.templates (type, subject, html_body) VALUES
('tenant-user-invite',
 'You''re invited to join {{.TenantName}}',
 '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You''re invited to join {{.TenantName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 24px;
        }
        .invite-details {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: 600;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>You''ve been invited! 🎉</h1>
        
        <p>You''ve been invited to join <strong>{{.TenantName}}</strong> with the role of <strong>{{.Role}}</strong>.</p>
        
        <div class="invite-details">
            <p><strong>Organization:</strong> {{.TenantName}}</p>
            <p><strong>Role:</strong> {{.Role}}</p>
        </div>
        
        <p>Click the button below to accept your invitation and get started:</p>
        
        <a href="{{.InviteURL}}" class="btn">Accept Invitation</a>
        
        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            Or copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">{{.InviteURL}}</span>
        </p>
        
        <div class="footer">
            <p>This invitation will expire in 7 days.</p>
            <p>If you weren''t expecting this invitation, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>');

-- Grant permissions to super_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA email TO super_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA email TO super_user;
