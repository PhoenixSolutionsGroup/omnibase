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

var (
	UpsertSystemTemplateError = errors.New("Failed to upsert system template")
	ListSystemTemplatesError  = errors.New("Failed to fetch system templates")
	DeleteSystemTemplateError = errors.New("Failed to delete system template")
)

type UpsertSystemTemplateRequest struct {
	Name          string `json:"name" required:"true" example:"verification"`
	Subject       string `json:"subject" required:"true" example:"Verify your email"`
	HTMLBody      string `json:"html_body" required:"true" example:"<h1>Verify your email</h1>"`
	PlaintextBody string `json:"plaintext_body,omitempty" example:"Verify your email"`
}

type UpsertSystemTemplateResponse struct {
	Message  string                         `json:"message"`
	Template repository.EmailSystemTemplate `json:"template"`
}

type CreateOrUpdateSystemTemplateInput struct {
	handlers.AuthCtx
	Body UpsertSystemTemplateRequest
}

type CreateOrUpdateSystemTemplateOutput struct {
	Body UpsertSystemTemplateResponse
}

func (h *Handler) CreateOrUpdateSystemTemplate(ctx context.Context, in *CreateOrUpdateSystemTemplateInput) (*CreateOrUpdateSystemTemplateOutput, error) {
	req := in.Body

	if !validTemplateName(req.Name) {
		return nil, huma.Error400BadRequest("Invalid template name")
	}

	tmpl, err := h.repo.UpsertSystemEmailTemplate(ctx, repository.UpsertSystemEmailTemplateParams{
		Name:          req.Name,
		Subject:       req.Subject,
		HtmlBody:      req.HTMLBody,
		PlaintextBody: req.PlaintextBody,
	})
	if err != nil {
		logger.Logger.Error("Failed to upsert system email template", "name", req.Name, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpsertSystemTemplateError, err).Error())
	}

	return &CreateOrUpdateSystemTemplateOutput{Body: UpsertSystemTemplateResponse{
		Message:  "System template saved successfully",
		Template: tmpl,
	}}, nil
}

type ListSystemTemplatesResponse struct {
	Templates []repository.EmailSystemTemplate `json:"templates"`
	Count     int                              `json:"count"`
}

type ListSystemTemplatesInput struct {
	handlers.AuthCtx
}

type ListSystemTemplatesOutput struct {
	Body ListSystemTemplatesResponse
}

func (h *Handler) ListSystemTemplates(ctx context.Context, _ *ListSystemTemplatesInput) (*ListSystemTemplatesOutput, error) {
	rows, err := h.repo.ListSystemEmailTemplates(ctx)
	if err != nil {
		logger.Logger.Error("Failed to fetch system email templates", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListSystemTemplatesError, err).Error())
	}

	return &ListSystemTemplatesOutput{Body: ListSystemTemplatesResponse{
		Templates: rows,
		Count:     len(rows),
	}}, nil
}

type DeleteSystemTemplateInput struct {
	handlers.AuthCtx
	Name string `path:"name"`
}

type DeleteSystemTemplateResponse struct {
	Message string `json:"message"`
}

type DeleteSystemTemplateOutput struct {
	Body DeleteSystemTemplateResponse
}

func (h *Handler) DeleteSystemTemplate(ctx context.Context, in *DeleteSystemTemplateInput) (*DeleteSystemTemplateOutput, error) {
	rows, err := h.repo.DeleteSystemEmailTemplateByName(ctx, in.Name)
	if err != nil {
		logger.Logger.Error("Failed to delete system email template", "name", in.Name, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteSystemTemplateError, err).Error())
	}
	if rows == 0 {
		return nil, huma.Error404NotFound("System template not found")
	}

	return &DeleteSystemTemplateOutput{Body: DeleteSystemTemplateResponse{Message: "System template deleted successfully"}}, nil
}
