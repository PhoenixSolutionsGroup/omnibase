package service

import (
	"api/internal/models"
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"net/url"
	"strings"

	"github.com/jordan-wright/email"
	"gorm.io/gorm"
)

type EmailService struct {
	host     string
	port     string
	username string
	password string
	from     string
	db       *gorm.DB
}

func NewEmailService(connectionURI, fromEmail string, db *gorm.DB) (*EmailService, error) {
	if connectionURI == "" {
		return nil, fmt.Errorf("SMTP connection URI is required")
	}

	// Parse SMTP URI: smtps://username:password@host:port/?params
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

	return &EmailService{
		host:     host,
		port:     port,
		username: username,
		password: password,
		from:     fromEmail,
		db:       db,
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

	// Create email using jordan-wright/email package
	em := email.NewEmail()
	em.From = e.from
	em.To = []string{to}
	em.Subject = emailTemplate.Subject
	em.HTML = bodyBuffer.Bytes()

	// Prepare SMTP address
	addr := fmt.Sprintf("%s:%s", e.host, e.port)

	// Send email with or without authentication
	if e.username != "" && e.password != "" {
		// Production SMTP with authentication (e.g., AWS SES)
		auth := smtp.PlainAuth("", e.username, e.password, e.host)
		return em.Send(addr, auth)
	}

	// Development SMTP without authentication (e.g., MailSlurper)
	return em.Send(addr, nil)
}
