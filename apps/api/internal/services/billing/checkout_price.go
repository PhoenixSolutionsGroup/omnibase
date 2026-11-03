package billing

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/services/stripe_config"
)

var (
	CheckoutPriceNotFoundError  = errors.New("Price not found in active config")
	CheckoutPriceForbiddenError = errors.New("Price is not available for checkout")
)

func (s *Service) ResolveCheckoutPrice(ctx context.Context, configPriceID string, tenantID uuid.UUID, serviceAuth bool) (string, error) {
	price, err := s.findConfigPrice(ctx, configPriceID)
	if err != nil {
		return "", err
	}

	tenant, err := s.loadCheckoutTenant(ctx, tenantID)
	if err != nil {
		return "", err
	}

	if err := authorizeConfigPrice(price, tenant, serviceAuth); err != nil {
		return "", err
	}

	return s.GetStripePriceID(ctx, configPriceID)
}

func (s *Service) findConfigPrice(ctx context.Context, configPriceID string) (*stripe_config.Price, error) {
	row, err := s.repo.GetLatestStripeConfig(ctx)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("%w: %s", CheckoutPriceNotFoundError, configPriceID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load active config: %w", err)
	}

	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, fmt.Errorf("failed to decode active config: %w", err)
	}

	config, err := stripe_config.NewValidator().ParseAndValidateConfig(raw)
	if err != nil {
		return nil, fmt.Errorf("failed to parse active config: %w", err)
	}

	for _, product := range config.Products {
		for i := range product.Prices {
			if product.Prices[i].ID == configPriceID {
				return &product.Prices[i], nil
			}
		}
	}

	return nil, fmt.Errorf("%w: %s", CheckoutPriceNotFoundError, configPriceID)
}

func (s *Service) loadCheckoutTenant(ctx context.Context, tenantID uuid.UUID) (*repository.GetTenantByIDRow, error) {
	if tenantID == uuid.Nil {
		return nil, nil
	}

	tenant, err := s.repo.GetTenantByID(ctx, tenantID.String())
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load tenant: %w", err)
	}
	return &tenant, nil
}

func authorizeConfigPrice(price *stripe_config.Price, tenant *repository.GetTenantByIDRow, serviceAuth bool) error {
	if !serviceAuth && price.Public != nil && !*price.Public {
		return fmt.Errorf("%w: %s is not public", CheckoutPriceForbiddenError, price.ID)
	}

	if price.EnterpriseID == "" && price.EnterpriseTemplate == "" {
		return nil
	}

	if tenant == nil {
		return fmt.Errorf("%w: %s requires enterprise access", CheckoutPriceForbiddenError, price.ID)
	}

	if price.EnterpriseID != "" && tenant.EnterpriseID != nil && *tenant.EnterpriseID == price.EnterpriseID {
		return nil
	}

	if price.EnterpriseTemplate != "" && tenant.EnterpriseTemplate != nil && *tenant.EnterpriseTemplate == price.EnterpriseTemplate {
		return nil
	}

	return fmt.Errorf("%w: %s requires enterprise access", CheckoutPriceForbiddenError, price.ID)
}
