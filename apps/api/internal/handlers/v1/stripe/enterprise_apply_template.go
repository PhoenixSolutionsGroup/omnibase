package stripe

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/stripe_config"
	"api/internal/services/billing"
)

var ApplyEnterpriseTemplateError = errors.New("Failed to apply enterprise template")

type ApplyEnterpriseTemplateRequest struct {
	TenantID           string `json:"tenant_id" binding:"required"`
	EnterpriseTemplate string `json:"enterprise_template" binding:"required"`
}

type EnterpriseApplyResponse struct {
	Message        string   `json:"message"`
	TenantID       string   `json:"tenant_id"`
	PricesSwapped  int      `json:"prices_swapped"`
	SwappedDetails []string `json:"swapped_details,omitempty"`
}

func (h *Handler) ApplyEnterpriseTemplate(ctx *gin.Context) {
	var req ApplyEnterpriseTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	tenant, err := h.repo.GetTenantByID(ctx.Request.Context(), req.TenantID)
	if err != nil {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Tenant not found: %s", req.TenantID))
		return
	}
	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
		return
	}

	candidates, err := h.enterpriseCandidatesByTemplate(ctx.Request.Context(), req.EnterpriseTemplate)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err))
		return
	}
	if len(candidates) == 0 {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No prices found for enterprise template: %s", req.EnterpriseTemplate))
		return
	}

	result, err := h.billing.ApplyEnterprisePricing(ctx.Request.Context(), billing.ApplyEnterprisePricingArgs{
		StripeCustomerID: *tenant.StripeCustomerID,
		Candidates:       candidates,
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err))
		return
	}

	if err := h.repo.UpdateTenantEnterpriseTemplate(ctx.Request.Context(), repository.UpdateTenantEnterpriseTemplateParams{
		ID:                 tenant.ID,
		EnterpriseTemplate: &req.EnterpriseTemplate,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseTemplateError, err))
		return
	}

	details := make([]string, 0, len(result.Swaps))
	for _, sw := range result.Swaps {
		details = append(details, fmt.Sprintf("%s -> %s (subscription: %s)", sw.OldStripePrice, sw.NewStripePrice, sw.SubscriptionID))
	}
	handlers.NewSuccessResponse(ctx, EnterpriseApplyResponse{
		Message:        "Enterprise pricing applied successfully",
		TenantID:       req.TenantID,
		PricesSwapped:  result.SwappedCount,
		SwappedDetails: details,
	})
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

func (h *Handler) latestParsedConfig(ctx context.Context) (*stripe_config.Configuration, error) {
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
