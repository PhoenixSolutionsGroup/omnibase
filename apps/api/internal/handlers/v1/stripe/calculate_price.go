package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var CalculatePriceCostError = errors.New("Failed to calculate price cost")

type CalculatePriceCostRequest struct {
	Quantity int64 `json:"quantity" binding:"required,min=0"`
}

type CalculatePriceCostResponse struct {
	PriceID                string  `json:"price_id" binding:"required"`
	Quantity               int64   `json:"quantity" binding:"required"`
	CostCents              int64   `json:"cost_cents" binding:"required"`
	EffectiveUnitCostCents float64 `json:"effective_unit_cost_cents" binding:"required"`
	Currency               string  `json:"currency" binding:"required"`
	BillingScheme          string  `json:"billing_scheme" binding:"required"`
	TiersMode              string  `json:"tiers_mode,omitempty"`
}

func (h *Handler) CalculatePriceCost(ctx *gin.Context) {
	priceID := ctx.Param("price_id")
	if priceID == "" {
		handlers.NewBadRequestResponse(ctx, "price_id is required")
		return
	}
	var req CalculatePriceCostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request: quantity is required and must be >= 0")
		return
	}
	parsed, err := h.latestParsedConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CalculatePriceCostError, err))
		return
	}
	var found *stripe_config.Price
	for _, product := range parsed.Products {
		for i := range product.Prices {
			if product.Prices[i].ID == priceID {
				found = &product.Prices[i]
				break
			}
		}
		if found != nil {
			break
		}
	}
	if found == nil {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Price not found: %s", priceID))
		return
	}

	costCents := calculatePriceCost(found, req.Quantity)
	var effective float64
	if req.Quantity > 0 {
		effective = float64(costCents) / float64(req.Quantity)
	}
	billingScheme := found.BillingScheme
	if billingScheme == "" {
		billingScheme = "per_unit"
	}
	handlers.NewSuccessResponse(ctx, CalculatePriceCostResponse{
		PriceID:                priceID,
		Quantity:               req.Quantity,
		CostCents:              costCents,
		EffectiveUnitCostCents: effective,
		Currency:               found.Currency,
		BillingScheme:          billingScheme,
		TiersMode:              found.TiersMode,
	})
}

func calculatePriceCost(price *stripe_config.Price, quantity int64) int64 {
	if quantity <= 0 {
		return 0
	}
	if price.BillingScheme == "tiered" && len(price.Tiers) > 0 {
		return calculateTieredCost(price, quantity)
	}
	return int64(price.Amount) * quantity
}

func calculateTieredCost(price *stripe_config.Price, quantity int64) int64 {
	if len(price.Tiers) == 0 {
		return 0
	}
	if price.TiersMode == "volume" {
		for _, tier := range price.Tiers {
			upTo := tierUpToValue(tier.UpTo)
			if upTo == -1 || quantity <= upTo {
				var cost int64
				if tier.FlatAmount != nil {
					cost += *tier.FlatAmount
				}
				if tier.UnitAmount != nil {
					cost += *tier.UnitAmount * quantity
				}
				return cost
			}
		}
		return 0
	}
	var totalCost int64
	remaining := quantity
	var prevUpTo int64
	for _, tier := range price.Tiers {
		if remaining <= 0 {
			break
		}
		upTo := tierUpToValue(tier.UpTo)
		var tierUnits int64
		if upTo == -1 {
			tierUnits = remaining
		} else {
			cap := upTo - prevUpTo
			tierUnits = min(remaining, cap)
		}
		if tierUnits > 0 && tier.FlatAmount != nil {
			totalCost += *tier.FlatAmount
		}
		if tier.UnitAmount != nil {
			totalCost += *tier.UnitAmount * tierUnits
		}
		remaining -= tierUnits
		if upTo != -1 {
			prevUpTo = upTo
		}
	}
	return totalCost
}

func tierUpToValue(upTo any) int64 {
	if upTo == nil {
		return -1
	}
	switch v := upTo.(type) {
	case string:
		return -1
	case float64:
		if v == 0 {
			return -1
		}
		return int64(v)
	case int64:
		if v == 0 {
			return -1
		}
		return v
	case int:
		if v == 0 {
			return -1
		}
		return int64(v)
	default:
		return -1
	}
}
