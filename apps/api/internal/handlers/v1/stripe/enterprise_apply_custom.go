package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/billing"
)

var ApplyEnterpriseCustomError = errors.New("Failed to apply enterprise custom pricing")

type ApplyEnterpriseCustomRequest struct {
	TenantID     string `json:"tenant_id" required:"true"`
	EnterpriseID string `json:"enterprise_id" required:"true"`
}

type ApplyEnterpriseCustomInput struct {
	handlers.AuthCtx
	Body ApplyEnterpriseCustomRequest
}

type ApplyEnterpriseCustomOutput struct {
	Body EnterpriseApplyResponse
}

func (h *Handler) ApplyEnterpriseCustom(ctx context.Context, in *ApplyEnterpriseCustomInput) (*ApplyEnterpriseCustomOutput, error) {
	tenant, err := h.repo.GetTenantByID(ctx, in.Body.TenantID)
	if err != nil {
		return nil, huma.Error404NotFound(fmt.Sprintf("Tenant not found: %s", in.Body.TenantID))
	}
	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("Tenant does not have a Stripe customer ID")
	}

	candidates, err := h.enterpriseCandidatesByID(ctx, in.Body.EnterpriseID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err).Error())
	}
	if len(candidates) == 0 {
		return nil, huma.Error404NotFound(fmt.Sprintf("No prices found for enterprise_id: %s", in.Body.EnterpriseID))
	}

	result, err := h.billing.ApplyEnterprisePricing(ctx, billing.ApplyEnterprisePricingArgs{
		StripeCustomerID: *tenant.StripeCustomerID,
		Candidates:       candidates,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err).Error())
	}

	if err := h.repo.UpdateTenantEnterpriseID(ctx, repository.UpdateTenantEnterpriseIDParams{
		ID:           tenant.ID,
		EnterpriseID: &in.Body.EnterpriseID,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err).Error())
	}

	details := make([]string, 0, len(result.Swaps))
	for _, sw := range result.Swaps {
		details = append(details, fmt.Sprintf("%s -> %s (subscription: %s)", sw.OldStripePrice, sw.NewStripePrice, sw.SubscriptionID))
	}
	return &ApplyEnterpriseCustomOutput{Body: EnterpriseApplyResponse{
		Message:        "Enterprise pricing applied successfully",
		TenantID:       in.Body.TenantID,
		PricesSwapped:  result.SwappedCount,
		SwappedDetails: details,
	}}, nil
}

func (h *Handler) enterpriseCandidatesByID(ctx context.Context, enterpriseID string) ([]billing.EnterprisePriceCandidate, error) {
	parsed, err := h.latestParsedConfig(ctx)
	if err != nil {
		return nil, err
	}
	var out []billing.EnterprisePriceCandidate
	for _, product := range parsed.Products {
		productStripeID, _ := h.stripeConfig.GetStripeIDByConfigItemID(ctx, product.ID, "product")
		for _, price := range product.Prices {
			if price.EnterpriseID != enterpriseID {
				continue
			}
			priceStripeID, _ := h.stripeConfig.GetStripeIDByConfigItemID(ctx, price.ID, "price")
			if priceStripeID == "" {
				continue
			}
			out = append(out, billing.EnterprisePriceCandidate{
				ConfigPriceID: price.ID,
				StripePriceID: priceStripeID,
				StripeProduct: productStripeID,
			})
		}
	}
	return out, nil
}
