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

	tmpl, err := h.repo.UpsertEmailTemplate(ctx, repository.UpsertEmailTemplateParams{
		Type:     req.Type,
		Subject:  req.Subject,
		HtmlBody: req.HTMLBody,
	})
	if err != nil {
		logger.Logger.Error("Failed to upsert email template", "type", req.Type, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpsertTemplateError, err).Error())
	}

	return &CreateOrUpdateTemplateOutput{Body: UpsertTemplateResponse{
		Message:  "Template saved successfully",
		Template: tmpl,
	}}, nil
}
