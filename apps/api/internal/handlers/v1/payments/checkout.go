package payments

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var CreateCheckoutError = errors.New("Failed to create checkout session")

type CreateCheckoutRequest struct {
	PriceID             string  `json:"price_id" binding:"required,min=1"`
	SuccessURL          string  `json:"success_url" binding:"required,min=1"`
	CancelURL           string  `json:"cancel_url" binding:"required,min=1"`
	TrialPeriodDays     *int64  `json:"trial_period_days,omitempty"`
	PromotionCode       string  `json:"promotion_code,omitempty"`
	AllowPromotionCodes *bool   `json:"allow_promotion_codes,omitempty"`
}

type CreateCheckoutResponse struct {
	URL       string `json:"url" binding:"required"`
	SessionID string `json:"session_id" binding:"required"`
}

func (h *Handler) CreateCheckout(ctx *gin.Context) {
	var req CreateCheckoutRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	mapping, err := h.billing.GetMappingByConfigID(ctx.Request.Context(), req.PriceID, "price")
	if err != nil {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
		return
	}

	customerIDStr, _ := ctx.Get("stripe_customer_id")
	customerID, _ := customerIDStr.(string)

	var promotionCode *string
	if req.PromotionCode != "" {
		promotionCode = &req.PromotionCode
	}

	session, err := h.billing.CreateCheckoutSession(ctx.Request.Context(), billing.CreateCheckoutSessionArgs{
		StripePriceID:       mapping.StripeID,
		SuccessURL:          req.SuccessURL,
		CancelURL:           req.CancelURL,
		StripeCustomerID:    customerID,
		TrialPeriodDays:     req.TrialPeriodDays,
		PromotionCode:       promotionCode,
		AllowPromotionCodes: req.AllowPromotionCodes,
	})
	if err != nil {
		if !handlers.HandleStripeError(ctx, err) {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateCheckoutError, err))
		}
		return
	}
	handlers.NewSuccessResponse(ctx, &CreateCheckoutResponse{
		URL:       session.URL,
		SessionID: session.ID,
	})
}
