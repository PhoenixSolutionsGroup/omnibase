package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetConfigHistoryError = errors.New("Failed to get stripe configuration history")

type ConfigHistoryItem struct {
	ID         uuid.UUID                         `json:"id" binding:"required"`
	Config     stripe_config.ConfigurationWithIDs `json:"config" binding:"required"`
	Version    string                            `json:"version" binding:"required"`
	CreatedAt  string                            `json:"created_at" binding:"required"`
	UpdatedAt  string                            `json:"updated_at" binding:"required"`
	ParseError *string                           `json:"parse_error,omitempty"`
}

type ConfigHistoryPagination struct {
	Total      int64 `json:"total" binding:"required"`
	Page       int   `json:"page" binding:"required"`
	PerPage    int   `json:"per_page" binding:"required"`
	TotalPages int   `json:"total_pages" binding:"required"`
	HasNext    bool  `json:"has_next" binding:"required"`
	HasPrev    bool  `json:"has_prev" binding:"required"`
}

type ConfigHistoryResponse struct {
	Configs    []ConfigHistoryItem     `json:"configs" binding:"required"`
	Pagination ConfigHistoryPagination `json:"pagination" binding:"required"`
}

func (h *Handler) GetConfigHistory(ctx *gin.Context) {
	queryParams := ctx.Request.URL.Query()
	for key := range queryParams {
		if key != "limit" && key != "offset" {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Unknown query parameter: %s", key))
			return
		}
	}

	limit := 10
	offset := 0
	if lp, exists := queryParams["limit"]; exists {
		if len(lp) == 0 || lp[0] == "" {
			handlers.NewBadRequestResponse(ctx, "Limit parameter cannot be empty")
			return
		}
		parsed, err := parsePositiveInt(lp[0])
		if err != nil || parsed < 1 {
			handlers.NewBadRequestResponse(ctx, "Limit must be at least 1")
			return
		}
		if parsed > 100 {
			handlers.NewBadRequestResponse(ctx, "Limit must not exceed 100")
			return
		}
		limit = parsed
	}
	if op, exists := queryParams["offset"]; exists {
		if len(op) == 0 || op[0] == "" {
			handlers.NewBadRequestResponse(ctx, "Offset parameter cannot be empty")
			return
		}
		parsed, err := parsePositiveInt(op[0])
		if err != nil {
			handlers.NewBadRequestResponse(ctx, "Invalid offset parameter")
			return
		}
		offset = parsed
	}

	total, err := h.repo.CountStripeConfigs(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigHistoryError, err))
		return
	}
	rows, err := h.repo.ListStripeConfigsPaginated(ctx.Request.Context(), repository.ListStripeConfigsPaginatedParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigHistoryError, err))
		return
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
			Config:    h.addStripeIDsToConfig(ctx.Request.Context(), *parsed, row.ID),
			Version:   row.Version,
			CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	totalPages := (int(total) + limit - 1) / limit
	currentPage := (offset / limit) + 1
	handlers.NewSuccessResponse(ctx, ConfigHistoryResponse{
		Configs: items,
		Pagination: ConfigHistoryPagination{
			Total:      total,
			Page:       currentPage,
			PerPage:    limit,
			TotalPages: totalPages,
			HasNext:    currentPage < totalPages,
			HasPrev:    currentPage > 1,
		},
	})
}

func parsePositiveInt(s string) (int, error) {
	if s == "" {
		return 0, fmt.Errorf("empty string")
	}
	var result int
	for _, r := range s {
		if r < '0' || r > '9' {
			return 0, fmt.Errorf("invalid character: %c", r)
		}
		result = result*10 + int(r-'0')
	}
	return result, nil
}
