package tenants

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var GetTenantByStripeCustomerIDError = errors.New("Failed to fetch tenant by Stripe customer ID")

type GetTenantByStripeCustomerIDInput struct {
	handlers.AuthCtx
	StripeCustomerID string `path:"stripe_customer_id"`
}

type GetTenantByStripeCustomerIDOutput struct {
	Body repository.GetTenantByStripeCustomerIDRow
}

func (h *Handler) GetTenantByStripeCustomerID(ctx context.Context, in *GetTenantByStripeCustomerIDInput) (*GetTenantByStripeCustomerIDOutput, error) {
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id is required")
	}

	stripeCustomerID := in.StripeCustomerID
	row, err := h.repo.GetTenantByStripeCustomerID(ctx, &stripeCustomerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Tenant not found")
		}
		logger.Logger.Error("Failed to fetch tenant by Stripe customer ID", "error", err, "stripe_customer_id", stripeCustomerID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetTenantByStripeCustomerIDError, err).Error())
	}

	return &GetTenantByStripeCustomerIDOutput{Body: row}, nil
}
