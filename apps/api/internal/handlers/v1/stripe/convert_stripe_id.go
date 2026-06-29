package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/handlers"
)

var ConvertStripeIDError = errors.New("Failed to convert stripe id")

type ConvertStripeIDResponse struct {
	StripeID     string    `json:"stripe_id" binding:"required"`
	ConfigID     string    `json:"config_id" binding:"required"`
	ItemType     string    `json:"item_type" binding:"required"`
	ConfigUUID   uuid.UUID `json:"config_uuid" binding:"required"`
	HistoryCount int       `json:"history_count" binding:"required"`
}

func (h *Handler) ConvertStripeIDToConfigID(ctx *gin.Context) {
	stripeID := ctx.Param("stripe_id")
	if stripeID == "" {
		handlers.NewBadRequestResponse(ctx, "stripe_id is required")
		return
	}
	row, err := h.repo.GetMappingByStripeID(ctx.Request.Context(), stripeID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No config ID found for stripe_id: %s", stripeID))
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ConvertStripeIDError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, ConvertStripeIDResponse{
		StripeID:     row.StripeID,
		ConfigID:     row.ConfigItemID,
		ItemType:     row.ItemType,
		ConfigUUID:   row.ConfigID,
		HistoryCount: len(row.StripeIDHistory),
	})
}
