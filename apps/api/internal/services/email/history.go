package email

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/logger"
)

func (s *Service) recordHistory(ctx context.Context, tenantID uuid.UUID, to, subject, html, plain, templateType string, templateData any) {
	if s.repo == nil {
		return
	}

	var tenant *string
	if tenantID != uuid.Nil {
		id := tenantID.String()
		tenant = &id
	}

	var ttype *string
	if templateType != "" {
		ttype = &templateType
	}

	var data []byte
	if templateData != nil {
		encoded, err := json.Marshal(templateData)
		if err != nil {
			logger.Logger.Warn("Failed to marshal email template data", "template", templateType, "error", err)
		} else {
			data = encoded
		}
	}

	if _, err := s.repo.RecordEmailSend(ctx, repository.RecordEmailSendParams{
		TenantID:      tenant,
		ToEmail:       to,
		Subject:       subject,
		HtmlBody:      html,
		PlaintextBody: plain,
		TemplateType:  ttype,
		TemplateData:  data,
	}); err != nil {
		logger.Logger.Error("Failed to record email history",
			"to", to,
			"template", templateType,
			"error", err)
	}
}
