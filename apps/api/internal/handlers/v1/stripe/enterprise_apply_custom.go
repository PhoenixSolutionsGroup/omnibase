package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/services/billing"
)

var ApplyEnterpriseCustomError = errors.New("Failed to apply enterprise custom pricing")

type ApplyEnterpriseCustomRequest struct {
	TenantID     string `json:"tenant_id" binding:"required"`
	EnterpriseID string `json:"enterprise_id" binding:"required"`
}

func (h *Handler) ApplyEnterpriseCustom(ctx *gin.Context) {
	var req ApplyEnterpriseCustomRequest
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

	candidates, err := h.enterpriseCandidatesByID(ctx.Request.Context(), req.EnterpriseID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err))
		return
	}
	if len(candidates) == 0 {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No prices found for enterprise_id: %s", req.EnterpriseID))
		return
	}

	result, err := h.billing.ApplyEnterprisePricing(ctx.Request.Context(), billing.ApplyEnterprisePricingArgs{
		StripeCustomerID: *tenant.StripeCustomerID,
		Candidates:       candidates,
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err))
		return
	}

	if err := h.repo.UpdateTenantEnterpriseID(ctx.Request.Context(), repository.UpdateTenantEnterpriseIDParams{
		ID:           tenant.ID,
		EnterpriseID: &req.EnterpriseID,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ApplyEnterpriseCustomError, err))
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
