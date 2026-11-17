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

var RemoveSubscriptionError = errors.New("Failed to remove tenant subscription")

type RemoveRequest struct {
	PlanID string `json:"plan_id" required:"true" minLength:"1" example:"price_test_basic"`
}

type RemoveResponse struct {
	SubscriptionID string `json:"subscription_id"`
	Status         string `json:"status"`
	Message        string `json:"message"`
}

type RemoveInput struct {
	Ctx
	Body RemoveRequest
}

type RemoveOutput struct {
	Body RemoveResponse
}

func (h *Handler) Remove(ctx context.Context, in *RemoveInput) (*RemoveOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	req := in.Body

	customerID := in.StripeCustomerID
	if customerID == "" {
		return nil, huma.Error400BadRequest("Tenant does not have a Stripe customer ID")
	}

	result, err := h.billing.RemoveTenantSubscription(ctx, billing.RemoveTenantSubscriptionArgs{
		StripeCustomerID: customerID,
		ConfigPriceID:    req.PlanID,
	})
	if err != nil {
		if errors.Is(err, billing.RemoveTenantSubscriptionNotFound) {
			return nil, huma.Error404NotFound(fmt.Sprintf("No active subscription found for plan: %s", req.PlanID))
		}
		if e := handlers.StripeError(err); e != nil {
			return nil, e
		}
		logger.Logger.Error("remove subscription failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", RemoveSubscriptionError, err).Error())
	}

	return &RemoveOutput{Body: RemoveResponse{
		SubscriptionID: result.SubscriptionID,
		Status:         result.Status,
		Message:        "Subscription canceled successfully",
	}}, nil
}
