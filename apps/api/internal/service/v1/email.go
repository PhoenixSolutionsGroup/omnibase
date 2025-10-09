package services_v1

import (
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
	if connectionURI == "" {
		return nil, fmt.Errorf("SMTP connection URI is required")
	}

	// Parse SMTP URI: smtp://username:password@host:port/?disable_starttls=true
	parsedURL, err := url.Parse(connectionURI)
	if err != nil {
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
	// Query the email template from PostgreSQL
	var emailTemplate models.EmailTemplate
	if err := e.db.Where("type = ?", "tenant-user-invite").First(&emailTemplate).Error; err != nil {
		return fmt.Errorf("failed to fetch email template: %w", err)
	}

	// Parse the template from database
	tmpl, err := template.New("email").Parse(emailTemplate.HTMLBody)
	if err != nil {
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
		return fmt.Errorf("failed to execute email template: %w", err)
	}

	// Build the email message with headers
	msg := e.buildMessage(to, emailTemplate.Subject, bodyBuffer.String())

	// Prepare SMTP address
	addr := fmt.Sprintf("%s:%s", e.host, e.port)

	// For plain SMTP without STARTTLS (MailSlurper), use direct connection
	if e.disableStartTLS {
		return e.sendPlainSMTP(addr, e.from, to, msg)
	}

	// For production SMTP with STARTTLS and authentication
	var auth smtp.Auth
	if e.username != "" && e.password != "" {
		auth = smtp.PlainAuth("", e.username, e.password, e.host)
	}

	// Send the email using standard smtp.SendMail (with STARTTLS)
	err = smtp.SendMail(addr, auth, e.from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// sendPlainSMTP sends email over plain SMTP without STARTTLS (for MailSlurper)
func (e *EmailService) sendPlainSMTP(addr, from, to, msg string) error {
	// Connect directly without TLS
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, e.host)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close()

	// Set sender
	if err := client.Mail(from); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send message data
	wc, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to open data writer: %w", err)
	}
	_, err = wc.Write([]byte(msg))
	if err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}
	err = wc.Close()
	if err != nil {
		return fmt.Errorf("failed to close data writer: %w", err)
	}

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
