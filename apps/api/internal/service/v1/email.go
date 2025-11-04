package services_v1

import (
	"api/internal/logger"
	"api/internal/models"
	"bytes"
	"fmt"
	"html/template"
	"net"
	"net/smtp"
	"net/url"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

type EmailService struct {
	host            string
	port            string
	username        string
	password        string
	from            string
	db              *gorm.DB
	disableStartTLS bool
}

func NewEmailService(connectionURI, fromEmail string, db *gorm.DB) (*EmailService, error) {
	logger.Logger.Info("Initializing email service", "from", fromEmail)

	if connectionURI == "" {
		logger.Logger.Error("SMTP connection URI is required")
		return nil, fmt.Errorf("SMTP connection URI is required")
	}

	// Parse SMTP URI: smtp://username:password@host:port/?disable_starttls=true
	parsedURL, err := url.Parse(connectionURI)
	if err != nil {
		logger.Logger.Error("Failed to parse SMTP URI", "error", err)
		return nil, fmt.Errorf("invalid SMTP URI: %w", err)
	}

	hostParts := strings.Split(parsedURL.Host, ":")
	host := hostParts[0]
	port := "587"
	if len(hostParts) > 1 {
		port = hostParts[1]
	}

	username := ""
	password := ""
	if parsedURL.User != nil {
		username = parsedURL.User.Username()
		password, _ = parsedURL.User.Password()
	}

	disableStartTLS, _ := strconv.ParseBool(parsedURL.Query().Get("disable_starttls"))

	logger.Logger.Info("Email service initialized successfully",
		"host", host,
		"port", port,
		"disableStartTLS", disableStartTLS)

	return &EmailService{
		host:            host,
		port:            port,
		username:        username,
		password:        password,
		from:            fromEmail,
		db:              db,
		disableStartTLS: disableStartTLS,
	}, nil
}

type InviteEmailData struct {
	TenantName string
	Role       string
	InviteURL  string
}

func (e *EmailService) SendInviteEmail(to, tenantName, role, inviteURL string) error {
	logger.Logger.Info("Sending invite email",
		"to", to,
		"tenantName", tenantName,
		"role", role)

	// Query the email template from PostgreSQL
	var emailTemplate models.EmailTemplate
	if err := e.db.Where("type = ?", "tenant-user-invite").First(&emailTemplate).Error; err != nil {
		logger.Logger.Error("Failed to fetch email template", "error", err)
		return fmt.Errorf("failed to fetch email template: %w", err)
	}
	logger.Logger.Debug("Email template fetched successfully", "subject", emailTemplate.Subject)

	// Parse the template from database
	tmpl, err := template.New("email").Parse(emailTemplate.HTMLBody)
	if err != nil {
		logger.Logger.Error("Failed to parse email template", "error", err)
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	// Prepare template data
	data := InviteEmailData{
		TenantName: tenantName,
		Role:       role,
		InviteURL:  inviteURL,
	}

	// Execute template
	var bodyBuffer bytes.Buffer
	if err := tmpl.Execute(&bodyBuffer, data); err != nil {
		logger.Logger.Error("Failed to execute email template", "error", err)
		return fmt.Errorf("failed to execute email template: %w", err)
	}
	logger.Logger.Debug("Email template executed successfully")

	// Build the email message with headers
	msg := e.buildMessage(to, emailTemplate.Subject, bodyBuffer.String())

	// Prepare SMTP address
	addr := fmt.Sprintf("%s:%s", e.host, e.port)

	// For plain SMTP without STARTTLS (MailSlurper), use direct connection
	if e.disableStartTLS {
		logger.Logger.Debug("Sending email via plain SMTP (no STARTTLS)", "address", addr)
		return e.sendPlainSMTP(addr, e.from, to, msg)
	}

	// For production SMTP with STARTTLS and authentication
	var auth smtp.Auth
	if e.username != "" && e.password != "" {
		auth = smtp.PlainAuth("", e.username, e.password, e.host)
	}

	logger.Logger.Info("Sending email via SMTP with STARTTLS", "address", addr)
	// Send the email using standard smtp.SendMail (with STARTTLS)
	err = smtp.SendMail(addr, auth, e.from, []string{to}, []byte(msg))
	if err != nil {
		logger.Logger.Error("Failed to send email", "error", err, "to", to)
		return fmt.Errorf("failed to send email: %w", err)
	}

	logger.Logger.Info("Invite email sent successfully", "to", to)
	return nil
}

// sendPlainSMTP sends email over plain SMTP without STARTTLS (for MailSlurper)
func (e *EmailService) sendPlainSMTP(addr, from, to, msg string) error {
	logger.Logger.Debug("Connecting to SMTP server", "address", addr)

	// Connect directly without TLS
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		logger.Logger.Error("Failed to connect to SMTP server", "error", err, "address", addr)
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, e.host)
	if err != nil {
		logger.Logger.Error("Failed to create SMTP client", "error", err)
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close()

	// Set sender
	if err := client.Mail(from); err != nil {
		logger.Logger.Error("Failed to set sender", "error", err, "from", from)
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err := client.Rcpt(to); err != nil {
		logger.Logger.Error("Failed to set recipient", "error", err, "to", to)
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send message data
	wc, err := client.Data()
	if err != nil {
		logger.Logger.Error("Failed to open data writer", "error", err)
		return fmt.Errorf("failed to open data writer: %w", err)
	}
	_, err = wc.Write([]byte(msg))
	if err != nil {
		logger.Logger.Error("Failed to write message", "error", err)
		return fmt.Errorf("failed to write message: %w", err)
	}
	err = wc.Close()
	if err != nil {
		logger.Logger.Error("Failed to close data writer", "error", err)
		return fmt.Errorf("failed to close data writer: %w", err)
	}

	logger.Logger.Info("Plain SMTP email sent successfully", "to", to)
	// Quit gracefully
	return client.Quit()
}

// buildMessage constructs the email message with headers
func (e *EmailService) buildMessage(to, subject, body string) string {
	headers := make(map[string]string)
	headers["From"] = e.from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	return message
}
