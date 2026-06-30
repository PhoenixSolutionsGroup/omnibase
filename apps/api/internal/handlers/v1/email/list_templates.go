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

var ListTemplatesError = errors.New("Failed to fetch templates")

type ListTemplatesResponse struct {
	Templates []repository.EmailTemplate `json:"templates"`
	Count     int                        `json:"count"`
}

type ListTemplatesInput struct {
	handlers.AuthCtx
}

type ListTemplatesOutput struct {
	Body ListTemplatesResponse
}

func (h *Handler) ListTemplates(ctx context.Context, _ *ListTemplatesInput) (*ListTemplatesOutput, error) {
	rows, err := h.repo.ListEmailTemplates(ctx)
	if err != nil {
		logger.Logger.Error("Failed to fetch email templates", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListTemplatesError, err).Error())
	}

	return &ListTemplatesOutput{Body: ListTemplatesResponse{
		Templates: rows,
		Count:     len(rows),
	}}, nil
}
