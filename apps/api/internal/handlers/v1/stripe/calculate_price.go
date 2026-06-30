package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var CalculatePriceCostError = errors.New("Failed to calculate price cost")

type CalculatePriceCostRequest struct {
	Quantity int64 `json:"quantity" required:"true" minimum:"0"`
}

type CalculatePriceCostResponse struct {
	PriceID                string  `json:"price_id" required:"true"`
	Quantity               int64   `json:"quantity" required:"true"`
	CostCents              int64   `json:"cost_cents" required:"true"`
	EffectiveUnitCostCents float64 `json:"effective_unit_cost_cents" required:"true"`
	Currency               string  `json:"currency" required:"true"`
	BillingScheme          string  `json:"billing_scheme" required:"true"`
	TiersMode              string  `json:"tiers_mode,omitempty"`
}

type CalculatePriceCostInput struct {
	handlers.AuthCtx
	PriceID string `path:"price_id"`
	Body    CalculatePriceCostRequest
}

type CalculatePriceCostOutput struct {
	Body CalculatePriceCostResponse
}

func (h *Handler) CalculatePriceCost(ctx context.Context, in *CalculatePriceCostInput) (*CalculatePriceCostOutput, error) {
	if in.PriceID == "" {
		return nil, huma.Error400BadRequest("price_id is required")
	}
	parsed, err := h.latestParsedConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CalculatePriceCostError, err).Error())
	}
	var found *stripe_config.Price
	for _, product := range parsed.Products {
		for i := range product.Prices {
			if product.Prices[i].ID == in.PriceID {
				found = &product.Prices[i]
				break
			}
		}
		if found != nil {
			break
		}
	}
	if found == nil {
		return nil, huma.Error404NotFound(fmt.Sprintf("Price not found: %s", in.PriceID))
	}

	costCents := calculatePriceCost(found, in.Body.Quantity)
	var effective float64
	if in.Body.Quantity > 0 {
		effective = float64(costCents) / float64(in.Body.Quantity)
	}
	billingScheme := found.BillingScheme
	if billingScheme == "" {
		billingScheme = "per_unit"
	}
	return &CalculatePriceCostOutput{Body: CalculatePriceCostResponse{
		PriceID:                in.PriceID,
		Quantity:               in.Body.Quantity,
		CostCents:              costCents,
		EffectiveUnitCostCents: effective,
		Currency:               found.Currency,
		BillingScheme:          billingScheme,
		TiersMode:              found.TiersMode,
	}}, nil
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
