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

func (h *Handler) ListTemplates(ctx context.Context, in *ListTemplatesInput) (*ListTemplatesOutput, error) {
	tenantID, err := tenantScope(in.Method, in.TenantID)
	if err != nil {
		return nil, err
	}

	rows, err := h.repo.ListEmailTemplatesForTenant(ctx, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to fetch email templates", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListTemplatesError, err).Error())
	}

	templates := make([]repository.EmailTemplate, len(rows))
	for i, row := range rows {
		templates[i] = repository.EmailTemplate{
			ID:        row.ID,
			Type:      row.Type,
			Subject:   row.Subject,
			HtmlBody:  row.HtmlBody,
			TenantID:  row.TenantID,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		}
	}

	return &ListTemplatesOutput{Body: ListTemplatesResponse{
		Templates: templates,
		Count:     len(templates),
	}}, nil
}
