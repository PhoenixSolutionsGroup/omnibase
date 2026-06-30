package subscriptions

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/handlers"
	"api/internal/logger"
)

var ListSubscriptionsError = errors.New("Failed to list tenant subscriptions")

type SubscriptionResponse struct {
	SubscriptionID     string `json:"subscription_id"`
	ConfigPriceID      string `json:"config_price_id"`
	Status             string `json:"status"`
	IsLegacyPrice      bool   `json:"is_legacy_price"`
	CurrentPeriodStart int64  `json:"current_period_start"`
	CurrentPeriodEnd   int64  `json:"current_period_end"`
	CancelAtPeriodEnd  bool   `json:"cancel_at_period_end"`
	CanceledAt         *int64 `json:"canceled_at,omitempty"`
	TrialStart         *int64 `json:"trial_start,omitempty"`
	TrialEnd           *int64 `json:"trial_end,omitempty"`
}

type ListInput struct {
	handlers.AuthCtx
}

type ListOutput struct {
	Body []SubscriptionResponse
}

func (h *Handler) List(ctx context.Context, in *ListInput) (*ListOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	row, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
	if err != nil {
		logger.Logger.Error("tenant lookup failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error404NotFound("Tenant not found")
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		return &ListOutput{Body: []SubscriptionResponse{}}, nil
	}

	subs, err := h.billing.ListTenantSubscriptions(ctx, *row.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("list subscriptions failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListSubscriptionsError, err).Error())
	}

	out := make([]SubscriptionResponse, 0, len(subs))
	for _, s := range subs {
		out = append(out, SubscriptionResponse(s))
	}
	return &ListOutput{Body: out}, nil
}
