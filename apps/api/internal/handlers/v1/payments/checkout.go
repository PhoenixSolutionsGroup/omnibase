package payments

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/authn"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var CreateCheckoutError = errors.New("Failed to create checkout session")

type CreateCheckoutRequest struct {
	LineItems           []LineItem `json:"line_items" required:"true" minItems:"1"`
	SuccessURL          string     `json:"success_url" required:"true" minLength:"1"`
	CancelURL           string     `json:"cancel_url" required:"true" minLength:"1"`
	TrialPeriodDays     *int64     `json:"trial_period_days,omitempty"`
	PromotionCode       string     `json:"promotion_code,omitempty"`
	AllowPromotionCodes *bool      `json:"allow_promotion_codes,omitempty"`
}

type LineItem struct {
	PriceID  string `json:"price_id" required:"true" minLength:"1"`
	Quantity int64  `json:"quantity" required:"false" default:"1"`
}

type CreateCheckoutResponse struct {
	URL       string `json:"url" required:"true"`
	SessionID string `json:"session_id" required:"true"`
}

type CreateCheckoutInput struct {
	PaymentsCtx
	Body CreateCheckoutRequest
}

type CreateCheckoutOutput struct {
	Body CreateCheckoutResponse
}

func (h *Handler) CreateCheckout(ctx context.Context, in *CreateCheckoutInput) (*CreateCheckoutOutput, error) {
	req := in.Body

	checkoutLineItems := make([]billing.CheckoutLineItem, len(req.LineItems))
	for i, item := range req.LineItems {
		stripePriceID, err := h.billing.ResolveCheckoutPrice(ctx, item.PriceID, in.TenantID, in.Method == authn.AuthServiceKey)
		if err != nil {
			switch {
			case errors.Is(err, billing.CheckoutPriceForbiddenError):
				logger.Logger.Warn("Rejected checkout for restricted price",
					"price_id", item.PriceID,
					"tenant_id", in.TenantID,
					"auth_method", in.Method)
				return nil, huma.Error403Forbidden(fmt.Sprintf("Price is not available: %s", item.PriceID))
			case errors.Is(err, billing.CheckoutPriceNotFoundError):
				return nil, huma.Error404NotFound(fmt.Sprintf("No Stripe price found for config_id: %s", item.PriceID))
			default:
				return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateCheckoutError, err).Error())
			}
		}
		checkoutLineItems[i] = billing.CheckoutLineItem{StripePriceID: stripePriceID, Quantity: item.Quantity}
	}

	var promotionCode *string
	if req.PromotionCode != "" {
		promotionCode = &req.PromotionCode
	}

	session, err := h.billing.CreateCheckoutSession(ctx, billing.CreateCheckoutSessionArgs{
		CheckoutLineItems:   checkoutLineItems,
		SuccessURL:          req.SuccessURL,
		CancelURL:           req.CancelURL,
		StripeCustomerID:    in.StripeCustomerID,
		TrialPeriodDays:     req.TrialPeriodDays,
		PromotionCode:       promotionCode,
		AllowPromotionCodes: req.AllowPromotionCodes,
	})
	if err != nil {
		if errors.Is(err, billing.CheckoutLineItemModeError) {
			return nil, huma.Error422UnprocessableEntity(err.Error())
		}
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateCheckoutError, err).Error())
	}

	return &CreateCheckoutOutput{Body: CreateCheckoutResponse{
		URL:       session.URL,
		SessionID: session.ID,
	}}, nil
}
