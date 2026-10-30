package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"

	"api/internal/services/stripe_config"
)

var (
	GetStripePriceIDError    = errors.New("Failed to resolve stripe price id")
	StripePriceNotFoundError = errors.New("Stripe price not found for config price")
)

func (s *Service) GetStripePriceID(ctx context.Context, configPriceID string) (string, error) {
	params := &stripe.PriceListParams{
		Active:     stripe.Bool(true),
		LookupKeys: []*string{stripe.String(configPriceID)},
	}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	for price, err := range s.stripe.Stripe.V1Prices.List(ctx, params) {
		if err != nil {
			return "", fmt.Errorf("%w: %w", GetStripePriceIDError, err)
		}
		if stripe_config.PriceConfigID(price) == configPriceID {
			return price.ID, nil
		}
	}
	return "", fmt.Errorf("%w: %s", StripePriceNotFoundError, configPriceID)
}
