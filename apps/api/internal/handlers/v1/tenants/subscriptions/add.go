package subscriptions

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var AddSubscriptionError = errors.New("Failed to add tenant subscription")

type AddRequest struct {
	PlanID           string `json:"plan_id" required:"true" minLength:"1" example:"price_test_basic"`
	StripeCustomerID string `json:"stripe_customer_id,omitempty" minLength:"1" example:"cus_test_123"`
	Quantity         int64  `json:"quantity,omitempty" example:"5"`
}

type AddResponse struct {
	SubscriptionID string `json:"subscription_id"`
	Status         string `json:"status"`
	Message        string `json:"message"`
}

type AddInput struct {
	handlers.AuthCtx
	Body AddRequest
}

type AddOutput struct {
	Body AddResponse
}

func (h *Handler) Add(ctx context.Context, in *AddInput) (*AddOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	req := in.Body

	customerID := req.StripeCustomerID
	if customerID == "" {
		row, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("Tenant not found: %w", err).Error())
		}
		if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
			return nil, huma.Error400BadRequest("Tenant does not have a Stripe customer ID")
		}
		customerID = *row.StripeCustomerID
	}

	result, err := h.billing.AddTenantSubscription(ctx, billing.AddTenantSubscriptionArgs{
		StripeCustomerID: customerID,
		ConfigPriceID:    req.PlanID,
		Quantity:         req.Quantity,
	})
	if err != nil {
		switch {
		case errors.Is(err, billing.AddTenantSubscriptionPlanNotFound):
			return nil, huma.Error404NotFound(fmt.Sprintf("Plan not found: %s", req.PlanID))
		case errors.Is(err, billing.AddTenantSubscriptionDuplicate):
			return nil, huma.Error400BadRequest(fmt.Sprintf("Subscription already exists for plan: %s", req.PlanID))
		}
		if e := handlers.StripeError(err); e != nil {
			return nil, e
		}
		logger.Logger.Error("add subscription failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AddSubscriptionError, err).Error())
	}

	return &AddOutput{Body: AddResponse{
		SubscriptionID: result.SubscriptionID,
		Status:         result.Status,
		Message:        "Subscription added successfully",
	}}, nil
}
