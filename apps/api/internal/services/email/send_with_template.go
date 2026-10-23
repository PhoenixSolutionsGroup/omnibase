package email

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"html/template"

	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/logger"
)

var (
	SendError     = errors.New("Failed to send email")
	TemplateError = errors.New("Failed to render email template")
)

type SendWithTemplateRequest struct {
	From         string
	To           string
	TemplateType string
	TenantID     uuid.UUID
	Data         any
}

func (s *Service) SendWithTemplate(ctx context.Context, req SendWithTemplateRequest) error {
	logger.Logger.Debug("Sending email", "to", req.To, "template", req.TemplateType)

	var tenantID *string
	if req.TenantID != uuid.Nil {
		id := req.TenantID.String()
		tenantID = &id
	}

	row, err := s.repo.GetEmailTemplateForTenant(ctx, repository.GetEmailTemplateForTenantParams{
		Type:     req.TemplateType,
		TenantID: tenantID,
	})
	if err != nil {
		return fmt.Errorf("%w: %w", TemplateError, err)
	}

	tmpl, err := template.New(req.TemplateType).Parse(row.HtmlBody)
	if err != nil {
		return fmt.Errorf("%w: %w", TemplateError, err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, req.Data); err != nil {
		return fmt.Errorf("%w: %w", TemplateError, err)
	}

	subjectTmpl, err := template.New(req.TemplateType + "-subject").Parse(row.Subject)
	if err != nil {
		return fmt.Errorf("%w: %w", TemplateError, err)
	}

	var subject bytes.Buffer
	if err := subjectTmpl.Execute(&subject, req.Data); err != nil {
		return fmt.Errorf("%w: %w", TemplateError, err)
	}

	from := s.fromOrDefault(req.From)
	msg := buildMessage(from, req.To, subject.String(), body.String(), s.extraHeaders...)
	if err := s.send(from, req.To, msg); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	s.recordHistory(ctx, req.TenantID, req.To, subject.String(), body.String(), "", req.TemplateType, req.Data)
	return nil
}
