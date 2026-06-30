package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/handlers"
)

var ConvertStripeIDError = errors.New("Failed to convert stripe id")

type ConvertStripeIDResponse struct {
	StripeID     string    `json:"stripe_id" required:"true"`
	ConfigID     string    `json:"config_id" required:"true"`
	ItemType     string    `json:"item_type" required:"true"`
	ConfigUUID   uuid.UUID `json:"config_uuid" required:"true"`
	HistoryCount int       `json:"history_count" required:"true"`
}

type ConvertStripeIDInput struct {
	handlers.AuthCtx
	StripeID string `path:"stripe_id"`
}

type ConvertStripeIDOutput struct {
	Body ConvertStripeIDResponse
}

func (h *Handler) ConvertStripeIDToConfigID(ctx context.Context, in *ConvertStripeIDInput) (*ConvertStripeIDOutput, error) {
	if in.StripeID == "" {
		return nil, huma.Error400BadRequest("stripe_id is required")
	}
	row, err := h.repo.GetMappingByStripeID(ctx, in.StripeID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound(fmt.Sprintf("No config ID found for stripe_id: %s", in.StripeID))
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ConvertStripeIDError, err).Error())
	}
	return &ConvertStripeIDOutput{Body: ConvertStripeIDResponse{
		StripeID:     row.StripeID,
		ConfigID:     row.ConfigItemID,
		ItemType:     row.ItemType,
		ConfigUUID:   row.ConfigID,
		HistoryCount: len(row.StripeIDHistory),
	}}, nil
}
