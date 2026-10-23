package email

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var UpsertTemplateError = errors.New("Failed to upsert template")

type UpsertTemplateRequest struct {
	Type     string `json:"type" required:"true" example:"test_welcome"`
	Subject  string `json:"subject" required:"true" example:"Welcome to Test Platform"`
	HTMLBody string `json:"html_body" required:"true" example:"<h1>Welcome!</h1>"`
}

type UpsertTemplateResponse struct {
	Message  string                   `json:"message"`
	Template repository.EmailTemplate `json:"template"`
}

type CreateOrUpdateTemplateInput struct {
	handlers.AuthCtx
	Body UpsertTemplateRequest
}

type CreateOrUpdateTemplateOutput struct {
	Body UpsertTemplateResponse
}

func (h *Handler) CreateOrUpdateTemplate(ctx context.Context, in *CreateOrUpdateTemplateInput) (*CreateOrUpdateTemplateOutput, error) {
	req := in.Body

	tenantID, err := tenantScope(in.Method, in.TenantID)
	if err != nil {
		return nil, err
	}

	var tmpl repository.EmailTemplate
	if tenantID == nil {
		row, err := h.repo.UpsertAppEmailTemplate(ctx, repository.UpsertAppEmailTemplateParams{
			Type:     req.Type,
			Subject:  req.Subject,
			HtmlBody: req.HTMLBody,
		})
		if err != nil {
			logger.Logger.Error("Failed to upsert app email template", "type", req.Type, "error", err)
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpsertTemplateError, err).Error())
		}
		tmpl = repository.EmailTemplate{
			ID:        row.ID,
			Type:      row.Type,
			Subject:   row.Subject,
			HtmlBody:  row.HtmlBody,
			TenantID:  row.TenantID,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		}
	} else {
		row, err := h.repo.UpsertTenantEmailTemplate(ctx, repository.UpsertTenantEmailTemplateParams{
			Type:     req.Type,
			Subject:  req.Subject,
			HtmlBody: req.HTMLBody,
			TenantID: tenantID,
		})
		if err != nil {
			logger.Logger.Error("Failed to upsert tenant email template", "type", req.Type, "tenant_id", *tenantID, "error", err)
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpsertTemplateError, err).Error())
		}
		tmpl = repository.EmailTemplate{
			ID:        row.ID,
			Type:      row.Type,
			Subject:   row.Subject,
			HtmlBody:  row.HtmlBody,
			TenantID:  row.TenantID,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		}
	}

	return &CreateOrUpdateTemplateOutput{Body: UpsertTemplateResponse{
		Message:  "Template saved successfully",
		Template: tmpl,
	}}, nil
}
