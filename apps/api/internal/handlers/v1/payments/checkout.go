package payments

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var CreateCheckoutError = errors.New("Failed to create checkout session")

type CreateCheckoutRequest struct {
	PriceID             string `json:"price_id" required:"true" minLength:"1"`
	SuccessURL          string `json:"success_url" required:"true" minLength:"1"`
	CancelURL           string `json:"cancel_url" required:"true" minLength:"1"`
	TrialPeriodDays     *int64 `json:"trial_period_days,omitempty"`
	PromotionCode       string `json:"promotion_code,omitempty"`
	AllowPromotionCodes *bool  `json:"allow_promotion_codes,omitempty"`
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

	mapping, err := h.billing.GetMappingByConfigID(ctx, req.PriceID, "price")
	if err != nil {
		return nil, huma.Error404NotFound(fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
	}

	var promotionCode *string
	if req.PromotionCode != "" {
		promotionCode = &req.PromotionCode
	}

	session, err := h.billing.CreateCheckoutSession(ctx, billing.CreateCheckoutSessionArgs{
		StripePriceID:       mapping.StripeID,
		SuccessURL:          req.SuccessURL,
		CancelURL:           req.CancelURL,
		StripeCustomerID:    in.StripeCustomerID,
		TrialPeriodDays:     req.TrialPeriodDays,
		PromotionCode:       promotionCode,
		AllowPromotionCodes: req.AllowPromotionCodes,
	})
	if err != nil {
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
