package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stripe/stripe-go/v82"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var ConvertStripeIDError = errors.New("Failed to convert stripe id")

type ConvertStripeIDResponse struct {
	StripeID   string    `json:"stripe_id" required:"true"`
	ConfigID   string    `json:"config_id" required:"true"`
	ItemType   string    `json:"item_type" required:"true"`
	ConfigUUID uuid.UUID `json:"config_uuid" required:"true"`
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

	latest, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("No Stripe configuration found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ConvertStripeIDError, err).Error())
	}

	itemType, configID, err := h.resolveConfigID(ctx, in.StripeID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ConvertStripeIDError, err).Error())
	}
	if configID == "" {
		return nil, huma.Error404NotFound(fmt.Sprintf("No config ID found for stripe_id: %s", in.StripeID))
	}

	return &ConvertStripeIDOutput{Body: ConvertStripeIDResponse{
		StripeID:   in.StripeID,
		ConfigID:   configID,
		ItemType:   itemType,
		ConfigUUID: latest.ID,
	}}, nil
}

type configIDResolver struct {
	itemType string
	resolve  func(context.Context, string) (string, error)
}

func (h *Handler) resolveConfigID(ctx context.Context, stripeID string) (string, string, error) {
	resolvers := []configIDResolver{
		{"product", h.productConfigID},
		{"price", h.priceConfigID},
		{"coupon", h.couponConfigID},
		{"promotion_code", h.promotionCodeConfigID},
		{"meter", h.meterConfigID},
	}
	for _, resolver := range resolvers {
		configID, err := resolver.resolve(ctx, stripeID)
		if err != nil {
			if isStripeResourceMissing(err) {
				continue
			}
			return "", "", err
		}
		if configID != "" {
			return resolver.itemType, configID, nil
		}
	}
	return "", "", nil
}

func (h *Handler) productConfigID(ctx context.Context, stripeID string) (string, error) {
	product, err := h.stripe.Stripe.V1Products.Retrieve(ctx, stripeID, &stripe.ProductRetrieveParams{})
	if err != nil {
		return "", err
	}
	return product.Metadata[stripe_config.MetadataKeyConfigID], nil
}

func (h *Handler) priceConfigID(ctx context.Context, stripeID string) (string, error) {
	price, err := h.stripe.Stripe.V1Prices.Retrieve(ctx, stripeID, &stripe.PriceRetrieveParams{})
	if err != nil {
		return "", err
	}
	return stripe_config.PriceConfigID(price), nil
}

func (h *Handler) couponConfigID(ctx context.Context, stripeID string) (string, error) {
	coupon, err := h.stripe.Stripe.V1Coupons.Retrieve(ctx, stripeID, &stripe.CouponRetrieveParams{})
	if err != nil {
		return "", err
	}
	return coupon.Metadata[stripe_config.MetadataKeyConfigID], nil
}

func (h *Handler) promotionCodeConfigID(ctx context.Context, stripeID string) (string, error) {
	promo, err := h.stripe.Stripe.V1PromotionCodes.Retrieve(ctx, stripeID, &stripe.PromotionCodeRetrieveParams{})
	if err != nil {
		return "", err
	}
	return promo.Metadata[stripe_config.MetadataKeyConfigID], nil
}

func (h *Handler) meterConfigID(ctx context.Context, stripeID string) (string, error) {
	meter, err := h.stripe.Stripe.V1BillingMeters.Retrieve(ctx, stripeID, &stripe.BillingMeterRetrieveParams{})
	if err != nil {
		return "", err
	}
	config, err := h.latestParsedConfig(ctx)
	if err != nil {
		return "", err
	}
	for _, m := range config.Meters {
		if m.EventName == meter.EventName {
			return m.ID, nil
		}
	}
	return "", nil
}

func isStripeResourceMissing(err error) bool {
	var stripeErr *stripe.Error
	return errors.As(err, &stripeErr) && stripeErr.Code == stripe.ErrorCodeResourceMissing
}
