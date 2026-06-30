package email

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"html/template"

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
	Data         any
}

func (s *Service) SendWithTemplate(ctx context.Context, req SendWithTemplateRequest) error {
	logger.Logger.Debug("Sending email", "to", req.To, "template", req.TemplateType)

	row, err := s.repo.GetEmailTemplateByType(ctx, req.TemplateType)
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

	from := s.fromOrDefault(req.From)
	msg := buildMessage(from, req.To, row.Subject, body.String())
	if err := s.send(from, req.To, msg); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	return nil
}
