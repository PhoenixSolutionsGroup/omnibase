package stripe

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/billing"
	"api/internal/services/stripe_config"
)

var ApplyEnterpriseTemplateError = errors.New("Failed to apply enterprise template")

type ApplyEnterpriseTemplateRequest struct {
	TenantID           string `json:"tenant_id" required:"true"`
	EnterpriseTemplate string `json:"enterprise_template" required:"true"`
}

type EnterpriseApplyResponse struct {
	Message        string   `json:"message"`
	TenantID       string   `json:"tenant_id"`
	PricesSwapped  int      `json:"prices_swapped"`
	SwappedDetails []string `json:"swapped_details,omitempty"`
}

type ApplyEnterpriseTemplateInput struct {
	handlers.AuthCtx
	Body ApplyEnterpriseTemplateRequest
}

type ApplyEnterpriseTemplateOutput struct {
	Body EnterpriseApplyResponse
}

func (h *Handler) ApplyEnterpriseTemplate(ctx context.Context, in *ApplyEnterpriseTemplateInput) (*ApplyEnterpriseTemplateOutput, error) {
	tenant, err := h.repo.GetTenantByID(ctx, in.Body.TenantID)
	if err != nil {
		return nil, huma.Error404NotFound(fmt.Sprintf("Tenant not found: %s", in.Body.TenantID))
	}
	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("Tenant does not have a Stripe customer ID")
	}

	candidates, err := h.enterpriseCandidatesByTemplate(ctx, in.Body.EnterpriseTemplate)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err).Error())
	}
	if len(candidates) == 0 {
		return nil, huma.Error404NotFound(fmt.Sprintf("No prices found for enterprise template: %s", in.Body.EnterpriseTemplate))
	}

	result, err := h.billing.ApplyEnterprisePricing(ctx, billing.ApplyEnterprisePricingArgs{
		StripeCustomerID: *tenant.StripeCustomerID,
		Candidates:       candidates,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err).Error())
	}

	if err := h.repo.UpdateTenantEnterpriseTemplate(ctx, repository.UpdateTenantEnterpriseTemplateParams{
		ID:                 tenant.ID,
		EnterpriseTemplate: &in.Body.EnterpriseTemplate,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err).Error())
	}

	details := make([]string, 0, len(result.Swaps))
	for _, sw := range result.Swaps {
		details = append(details, fmt.Sprintf("%s -> %s (subscription: %s)", sw.OldStripePrice, sw.NewStripePrice, sw.SubscriptionID))
	}
	return &ApplyEnterpriseTemplateOutput{Body: EnterpriseApplyResponse{
		Message:        "Enterprise pricing applied successfully",
		TenantID:       in.Body.TenantID,
		PricesSwapped:  result.SwappedCount,
		SwappedDetails: details,
	}}, nil
}

func (h *Handler) enterpriseCandidatesByTemplate(ctx context.Context, template string) ([]billing.EnterprisePriceCandidate, error) {
	parsed, err := h.latestParsedConfig(ctx)
	if err != nil {
		return nil, err
	}
	var out []billing.EnterprisePriceCandidate
	for _, product := range parsed.Products {
		productStripeID, _ := h.stripeConfig.GetStripeIDByConfigItemID(ctx, product.ID, "product")
		for _, price := range product.Prices {
			if price.EnterpriseTemplate != template {
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

func (h *Handler) latestParsedConfig(ctx context.Context) (*stripe_config.StripeConfiguration, error) {
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get latest config: %w", err)
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, fmt.Errorf("failed to decode config: %w", err)
	}
	return h.stripeConfig.ParseAndValidate(raw)
}
