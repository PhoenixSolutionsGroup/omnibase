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

var DeleteTemplateError = errors.New("Failed to delete template")

type DeleteTemplateResponse struct {
	Message string `json:"message"`
}

type DeleteTemplateInput struct {
	handlers.AuthCtx
	Type string `path:"type"`
}

type DeleteTemplateOutput struct {
	Body DeleteTemplateResponse
}

func (h *Handler) DeleteTemplate(ctx context.Context, in *DeleteTemplateInput) (*DeleteTemplateOutput, error) {
	tenantID, err := tenantScope(in.Method, in.TenantID)
	if err != nil {
		return nil, err
	}

	rows, err := h.repo.DeleteEmailTemplateByType(ctx, repository.DeleteEmailTemplateByTypeParams{
		Type:     in.Type,
		TenantID: tenantID,
	})
	if err != nil {
		logger.Logger.Error("Failed to delete email template", "type", in.Type, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTemplateError, err).Error())
	}
	if rows == 0 {
		return nil, huma.Error404NotFound("Template not found")
	}

	return &DeleteTemplateOutput{Body: DeleteTemplateResponse{Message: "Template deleted successfully"}}, nil
}
