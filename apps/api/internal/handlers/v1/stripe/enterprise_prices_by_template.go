package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetPricesByTemplateError = errors.New("Failed to list enterprise prices by template")

type EnterprisePricesResponse struct {
	Prices []stripe_config.PriceWithStripeID `json:"prices"`
	Count  int                               `json:"count"`
}

type GetPricesByTemplateInput struct {
	handlers.AuthCtx
	Template string `path:"template"`
}

type GetPricesByTemplateOutput struct {
	Body EnterprisePricesResponse
}

func (h *Handler) GetPricesByTemplate(ctx context.Context, in *GetPricesByTemplateInput) (*GetPricesByTemplateOutput, error) {
	parsed, err := h.latestParsedConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetPricesByTemplateError, err).Error())
	}
	prices := h.collectEnterprisePrices(ctx, parsed, func(p stripe_config.Price) bool {
		return p.EnterpriseTemplate == in.Template
	})
	return &GetPricesByTemplateOutput{Body: EnterprisePricesResponse{Prices: prices, Count: len(prices)}}, nil
}

func (h *Handler) collectEnterprisePrices(ctx context.Context, parsed *stripe_config.StripeConfiguration, match func(p stripe_config.Price) bool) []stripe_config.PriceWithStripeID {
	out := []stripe_config.PriceWithStripeID{}
	for _, product := range parsed.Products {
		for _, price := range product.Prices {
			if !match(price) {
				continue
			}
			pwid := stripe_config.PriceWithStripeID{Price: price}
			if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, price.ID, "price"); err == nil && id != "" {
				pwid.StripeID = &id
			}
			out = append(out, pwid)
		}
	}
	return out
}
