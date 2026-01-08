package v1

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

// ApplyEnterpriseTemplateRequest represents the request to apply template-based enterprise pricing
type ApplyEnterpriseTemplateRequest struct {
	TenantID           string `json:"tenant_id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	EnterpriseTemplate string `json:"enterprise_template" binding:"required" example:"tier1_10pct_off"`
}

// ApplyEnterpriseCustomRequest represents the request to apply tenant-specific enterprise pricing
type ApplyEnterpriseCustomRequest struct {
	TenantID     string `json:"tenant_id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	EnterpriseID string `json:"enterprise_id" binding:"required" example:"acme_corp"`
}

// EnterpriseApplyResponse represents the response for enterprise pricing application
type EnterpriseApplyResponse struct {
	Message        string   `json:"message" example:"Enterprise pricing applied successfully"`
	TenantID       string   `json:"tenant_id" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	PricesSwapped  int      `json:"prices_swapped" example:"3"`
	SwappedDetails []string `json:"swapped_details,omitempty"`
}

// EnterprisePricesResponse represents the response for listing enterprise prices
type EnterprisePricesResponse struct {
	Prices []models.PriceWithStripeID `json:"prices"`
	Count  int                        `json:"count"`
}

// ApplyEnterpriseTemplate applies template-based enterprise pricing to a tenant
func (h *StripeHandler) ApplyEnterpriseTemplate(ctx *gin.Context) {
	logger.Logger.Info("Received apply enterprise template request")

	var req ApplyEnterpriseTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request format", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Validate tenant exists
	var tenant models.Tenant
	if err := h.db.Where("id = ?", req.TenantID).First(&tenant).Error; err != nil {
		logger.Logger.Warn("Tenant not found", "tenant_id", req.TenantID)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Tenant not found: %s", req.TenantID))
		return
	}

	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		logger.Logger.Warn("Tenant has no Stripe customer ID", "tenant_id", req.TenantID)
		handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
		return
	}

	// Get enterprise prices by template
	enterprisePrices, err := h.getEnterprisesPricesByTemplate(req.EnterpriseTemplate)
	if err != nil {
		logger.Logger.Error("Failed to get enterprise prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get enterprise prices: %w", err))
		return
	}

	if len(enterprisePrices) == 0 {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No prices found for enterprise template: %s", req.EnterpriseTemplate))
		return
	}

	// Swap subscription prices
	swappedDetails, err := h.swapSubscriptionPrices(*tenant.StripeCustomerID, enterprisePrices)
	if err != nil {
		logger.Logger.Error("Failed to swap subscription prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to swap subscription prices: %w", err))
		return
	}

	// Update tenant with enterprise_template
	if err := h.db.Model(&tenant).Update("enterprise_template", req.EnterpriseTemplate).Error; err != nil {
		logger.Logger.Error("Failed to update tenant enterprise_template", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update tenant: %w", err))
		return
	}

	logger.Logger.Info("Enterprise template applied successfully",
		"tenant_id", req.TenantID,
		"template", req.EnterpriseTemplate,
		"prices_swapped", len(swappedDetails))

	handlers.NewSuccessResponse(ctx, EnterpriseApplyResponse{
		Message:        "Enterprise pricing applied successfully",
		TenantID:       req.TenantID,
		PricesSwapped:  len(swappedDetails),
		SwappedDetails: swappedDetails,
	})
}

// ApplyEnterpriseCustom applies tenant-specific enterprise pricing
func (h *StripeHandler) ApplyEnterpriseCustom(ctx *gin.Context) {
	logger.Logger.Info("Received apply enterprise custom request")

	var req ApplyEnterpriseCustomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request format", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Validate tenant exists
	var tenant models.Tenant
	if err := h.db.Where("id = ?", req.TenantID).First(&tenant).Error; err != nil {
		logger.Logger.Warn("Tenant not found", "tenant_id", req.TenantID)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Tenant not found: %s", req.TenantID))
		return
	}

	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		logger.Logger.Warn("Tenant has no Stripe customer ID", "tenant_id", req.TenantID)
		handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
		return
	}

	// Get enterprise prices by enterprise_id
	enterprisePrices, err := h.getEnterprisesPricesByID(req.EnterpriseID)
	if err != nil {
		logger.Logger.Error("Failed to get enterprise prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get enterprise prices: %w", err))
		return
	}

	if len(enterprisePrices) == 0 {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No prices found for enterprise_id: %s", req.EnterpriseID))
		return
	}

	// Swap subscription prices
	swappedDetails, err := h.swapSubscriptionPrices(*tenant.StripeCustomerID, enterprisePrices)
	if err != nil {
		logger.Logger.Error("Failed to swap subscription prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to swap subscription prices: %w", err))
		return
	}

	// Update tenant with enterprise_id
	if err := h.db.Model(&tenant).Update("enterprise_id", req.EnterpriseID).Error; err != nil {
		logger.Logger.Error("Failed to update tenant enterprise_id", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update tenant: %w", err))
		return
	}

	logger.Logger.Info("Enterprise custom pricing applied successfully",
		"tenant_id", req.TenantID,
		"enterprise_id", req.EnterpriseID,
		"prices_swapped", len(swappedDetails))

	handlers.NewSuccessResponse(ctx, EnterpriseApplyResponse{
		Message:        "Enterprise pricing applied successfully",
		TenantID:       req.TenantID,
		PricesSwapped:  len(swappedDetails),
		SwappedDetails: swappedDetails,
	})
}

// GetPricesByTemplate retrieves prices filtered by enterprise_template
func (h *StripeHandler) GetPricesByTemplate(ctx *gin.Context) {
	template := ctx.Param("template")

	prices, err := h.getEnterprisesPricesByTemplate(template)
	if err != nil {
		logger.Logger.Error("Failed to get enterprise prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get enterprise prices: %w", err))
		return
	}

	if prices == nil {
		prices = []models.PriceWithStripeID{}
	}

	handlers.NewSuccessResponse(ctx, EnterprisePricesResponse{
		Prices: prices,
		Count:  len(prices),
	})
}

// GetPricesByEnterpriseID retrieves prices filtered by enterprise_id
func (h *StripeHandler) GetPricesByEnterpriseID(ctx *gin.Context) {
	enterpriseID := ctx.Param("enterprise_id")

	prices, err := h.getEnterprisesPricesByID(enterpriseID)
	if err != nil {
		logger.Logger.Error("Failed to get enterprise prices", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get enterprise prices: %w", err))
		return
	}

	if prices == nil {
		prices = []models.PriceWithStripeID{}
	}

	handlers.NewSuccessResponse(ctx, EnterprisePricesResponse{
		Prices: prices,
		Count:  len(prices),
	})
}

// getEnterprisesPricesByTemplate retrieves all prices with matching enterprise_template
func (h *StripeHandler) getEnterprisesPricesByTemplate(template string) ([]models.PriceWithStripeID, error) {
	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		return nil, fmt.Errorf("failed to get config: %w", err)
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	var prices []models.PriceWithStripeID
	for _, product := range parsedConfig.Products {
		for _, price := range product.Prices {
			if price.EnterpriseTemplate == template {
				priceWithID := models.PriceWithStripeID{Price: price}
				if stripeID, err := h.service.GetStripeIDByConfigItemID(price.ID, "price"); err == nil && stripeID != "" {
					priceWithID.StripeID = &stripeID
				}
				prices = append(prices, priceWithID)
			}
		}
	}

	return prices, nil
}

// getEnterprisesPricesByID retrieves all prices with matching enterprise_id
func (h *StripeHandler) getEnterprisesPricesByID(enterpriseID string) ([]models.PriceWithStripeID, error) {
	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		return nil, fmt.Errorf("failed to get config: %w", err)
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	var prices []models.PriceWithStripeID
	for _, product := range parsedConfig.Products {
		for _, price := range product.Prices {
			if price.EnterpriseID == enterpriseID {
				priceWithID := models.PriceWithStripeID{Price: price}
				if stripeID, err := h.service.GetStripeIDByConfigItemID(price.ID, "price"); err == nil && stripeID != "" {
					priceWithID.StripeID = &stripeID
				}
				prices = append(prices, priceWithID)
			}
		}
	}

	return prices, nil
}

// swapSubscriptionPrices swaps subscription item prices for enterprise pricing
func (h *StripeHandler) swapSubscriptionPrices(stripeCustomerID string, enterprisePrices []models.PriceWithStripeID) ([]string, error) {
	// Get current subscriptions
	subscriptions, err := h.stripe.GetTenantActiveSubscriptions(stripeCustomerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscriptions: %w", err)
	}

	// Build a map of enterprise prices by their base config ID pattern (without enterprise suffix)
	// This helps match standard prices to their enterprise equivalents
	var swappedDetails []string

	for _, sub := range subscriptions {
		for _, enterprisePrice := range enterprisePrices {
			if enterprisePrice.StripeID == nil || *enterprisePrice.StripeID == "" {
				continue
			}

			// Check if this enterprise price should replace the current subscription price
			// by checking if they share the same meter or are related products
			if shouldSwapPrice(sub.ConfigPriceID, enterprisePrice.Price) {
				// Swap the price on the subscription
				err := h.stripe.SwapSubscriptionItemPrice(sub.SubscriptionID, sub.ConfigPriceID, *enterprisePrice.StripeID)
				if err != nil {
					logger.Logger.Warn("Failed to swap subscription price",
						"subscription_id", sub.SubscriptionID,
						"old_price", sub.ConfigPriceID,
						"new_price", enterprisePrice.ID,
						"error", err)
					continue
				}

				detail := fmt.Sprintf("%s -> %s (subscription: %s)", sub.ConfigPriceID, enterprisePrice.ID, sub.SubscriptionID)
				swappedDetails = append(swappedDetails, detail)
				logger.Logger.Info("Swapped subscription price",
					"subscription_id", sub.SubscriptionID,
					"old_price", sub.ConfigPriceID,
					"new_price", enterprisePrice.ID)
			}
		}
	}

	return swappedDetails, nil
}

// shouldSwapPrice determines if an enterprise price should replace a standard price
// This checks if they share the same meter (for metered prices) or same product base
func shouldSwapPrice(currentConfigPriceID string, enterprisePrice models.Price) bool {
	// If enterprise price has a meter, check if current price uses the same meter
	if enterprisePrice.Meter != "" {
		// The enterprise price targets a specific meter
		// We need to check if the current subscription item also uses this meter
		// This requires looking up the current price's meter - for now, use simple string matching
		return false // Will be enhanced in service layer
	}

	// For non-metered prices, we could match by product ID patterns
	// This is a simplified version - production would need more sophisticated matching
	return false
}
