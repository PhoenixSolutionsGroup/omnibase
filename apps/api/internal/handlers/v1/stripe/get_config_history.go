package stripe

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetConfigHistoryError = errors.New("Failed to get stripe configuration history")

type ConfigHistoryItem struct {
	ID         uuid.UUID                          `json:"id" required:"true"`
	Config     stripe_config.ConfigurationWithIDs `json:"config" required:"true"`
	Version    string                             `json:"version" required:"true"`
	CreatedAt  string                             `json:"created_at" required:"true"`
	UpdatedAt  string                             `json:"updated_at" required:"true"`
	ParseError *string                            `json:"parse_error,omitempty"`
}

type ConfigHistoryPagination struct {
	Total      int64 `json:"total" required:"true"`
	Page       int   `json:"page" required:"true"`
	PerPage    int   `json:"per_page" required:"true"`
	TotalPages int   `json:"total_pages" required:"true"`
	HasNext    bool  `json:"has_next" required:"true"`
	HasPrev    bool  `json:"has_prev" required:"true"`
}

type ConfigHistoryResponse struct {
	Configs    []ConfigHistoryItem     `json:"configs" required:"true"`
	Pagination ConfigHistoryPagination `json:"pagination" required:"true"`
}

type GetConfigHistoryInput struct {
	handlers.AuthCtx
	Limit  int `query:"limit" default:"10"`
	Offset int `query:"offset" default:"0"`
}

type GetConfigHistoryOutput struct {
	Body ConfigHistoryResponse
}

func (h *Handler) GetConfigHistory(ctx context.Context, in *GetConfigHistoryInput) (*GetConfigHistoryOutput, error) {
	limit := in.Limit
	offset := in.Offset
	if limit < 1 {
		return nil, huma.Error400BadRequest("Limit must be at least 1")
	}
	if limit > 100 {
		return nil, huma.Error400BadRequest("Limit must not exceed 100")
	}
	if offset < 0 {
		return nil, huma.Error400BadRequest("Invalid offset parameter")
	}

	total, err := h.repo.CountStripeConfigs(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigHistoryError, err).Error())
	}
	rows, err := h.repo.ListStripeConfigsPaginated(ctx, repository.ListStripeConfigsPaginatedParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigHistoryError, err).Error())
	}

	items := make([]ConfigHistoryItem, 0, len(rows))
	for _, row := range rows {
		var raw stripe_config.ConfigData
		if err := json.Unmarshal(row.Config, &raw); err != nil {
			msg := err.Error()
			items = append(items, ConfigHistoryItem{
				ID:      row.ID,
				Version: row.Version,
				Config: stripe_config.ConfigurationWithIDs{
					Version:  row.Version,
					Meters:   []stripe_config.MeterWithStripeID{},
					Products: []stripe_config.ProductWithStripeIDs{},
				},
				CreatedAt:  row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
				UpdatedAt:  row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
				ParseError: &msg,
			})
			continue
		}
		parsed, err := h.stripeConfig.ParseAndValidate(raw)
		if err != nil {
			msg := err.Error()
			items = append(items, ConfigHistoryItem{
				ID:      row.ID,
				Version: row.Version,
				Config: stripe_config.ConfigurationWithIDs{
					Version:  row.Version,
					Meters:   []stripe_config.MeterWithStripeID{},
					Products: []stripe_config.ProductWithStripeIDs{},
				},
				CreatedAt:  row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
				UpdatedAt:  row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
				ParseError: &msg,
			})
			continue
		}
		items = append(items, ConfigHistoryItem{
			ID:        row.ID,
			Config:    h.addStripeIDsToConfig(ctx, *parsed, row.ID),
			Version:   row.Version,
			CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	totalPages := (int(total) + limit - 1) / limit
	currentPage := (offset / limit) + 1
	return &GetConfigHistoryOutput{Body: ConfigHistoryResponse{
		Configs: items,
		Pagination: ConfigHistoryPagination{
			Total:      total,
			Page:       currentPage,
			PerPage:    limit,
			TotalPages: totalPages,
			HasNext:    currentPage < totalPages,
			HasPrev:    currentPage > 1,
		},
	}}, nil
}
