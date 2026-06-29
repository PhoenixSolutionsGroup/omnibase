package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

var GetMeterError = errors.New("Failed to get meter by id")

type GetMeterResponse struct {
	Meter models.MeterWithStripeID `json:"meter" binding:"required"`
}

func (h *Handler) GetMeterByID(ctx *gin.Context) {
	meterID := ctx.Param("meter_id")
	if meterID == "" {
		handlers.NewBadRequestResponse(ctx, "meter_id is required")
		return
	}
	row, err := h.repo.GetLatestStripeConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetMeterError, err))
		return
	}
	var raw models.StripeConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetMeterError, err))
		return
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetMeterError, err))
		return
	}
	configWithIDs := h.addStripeIDsToConfig(ctx.Request.Context(), *parsed, row.ID)
	for _, m := range configWithIDs.Meters {
		if m.ID == meterID {
			handlers.NewSuccessResponse(ctx, GetMeterResponse{Meter: m})
			return
		}
	}
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Meter not found: %s", meterID))
}
