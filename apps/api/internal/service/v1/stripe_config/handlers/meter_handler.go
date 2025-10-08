package handlers

import (
	"context"
	"fmt"

	"api/internal/models"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/billing/meter"
)

type MeterHandler struct {
	client    *stripe.Client
	idMapper  IDMapperInterface
	accountID string
}

func NewMeterHandler(client *stripe.Client, idMapper IDMapperInterface, accountID string) *MeterHandler {
	return &MeterHandler{
		client:    client,
		idMapper:  idMapper,
		accountID: accountID,
	}
}

// CreateMeter creates a new meter in Stripe using the official v82 API structure
func (h *MeterHandler) CreateMeter(ctx context.Context, configID uuid.UUID, meterConfig models.Meter) (string, error) {

	// Use the EXACT structure from official Stripe docs
	params := &stripe.BillingMeterParams{
		DisplayName: stripe.String(meterConfig.DisplayName),
		EventName:   stripe.String(meterConfig.EventName),
		DefaultAggregation: &stripe.BillingMeterDefaultAggregationParams{
			Formula: stripe.String(meterConfig.DefaultAggregation.Formula),
		},
	}

	// Add customer mapping if provided (use defaults if not)
	if meterConfig.CustomerMapping != nil {
		params.CustomerMapping = &stripe.BillingMeterCustomerMappingParams{
			EventPayloadKey: stripe.String(meterConfig.CustomerMapping.EventPayloadKey),
			Type:            stripe.String(meterConfig.CustomerMapping.Type),
		}
	} else {
		// Use Stripe defaults as shown in official docs
		params.CustomerMapping = &stripe.BillingMeterCustomerMappingParams{
			EventPayloadKey: stripe.String("stripe_customer_id"),
			Type:            stripe.String("by_id"),
		}
	}

	// Add value settings if provided (use defaults if not)
	if meterConfig.ValueSettings != nil {
		params.ValueSettings = &stripe.BillingMeterValueSettingsParams{
			EventPayloadKey: stripe.String(meterConfig.ValueSettings.EventPayloadKey),
		}
	} else {
		// Use Stripe defaults as shown in official docs
		params.ValueSettings = &stripe.BillingMeterValueSettingsParams{
			EventPayloadKey: stripe.String("value"),
		}
	}

	// Add Connect account if in managed mode
	if h.accountID != "" {
		params.SetStripeAccount(h.accountID)
	}

	result, err := meter.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create meter %s: %w", meterConfig.ID, err)
	}

	// Save meter ID mapping if we have config ID and idMapper
	if configID != uuid.Nil && h.idMapper != nil {
		if err := h.idMapper.SaveIDMapping(configID, meterConfig.ID, result.ID, "meter"); err != nil {
			return "", fmt.Errorf("failed to save meter ID mapping: %w", err)
		}
	}

	return result.ID, nil
}

// GetMeter retrieves a meter from Stripe using v82 API
func (h *MeterHandler) GetMeter(ctx context.Context, stripeID string) (*stripe.BillingMeter, error) {
	params := &stripe.BillingMeterParams{}
	if h.accountID != "" {
		params.SetStripeAccount(h.accountID)
	}
	result, err := meter.Get(stripeID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get meter %s: %w", stripeID, err)
	}
	return result, nil
}

// UpdateMeter updates a meter in Stripe using v82 API (meters have limited update capabilities)
func (h *MeterHandler) UpdateMeter(ctx context.Context, stripeID string, meterConfig models.Meter) error {
	params := &stripe.BillingMeterParams{
		DisplayName: stripe.String(meterConfig.DisplayName),
	}

	// Add Connect account if in managed mode
	if h.accountID != "" {
		params.SetStripeAccount(h.accountID)
	}

	_, err := meter.Update(stripeID, params)
	if err != nil {
		return fmt.Errorf("failed to update meter %s: %w", stripeID, err)
	}

	return nil
}

// ListMeters lists all meters using v82 API
func (h *MeterHandler) ListMeters(ctx context.Context) ([]*stripe.BillingMeter, error) {
	params := &stripe.BillingMeterListParams{}
	if h.accountID != "" {
		params.SetStripeAccount(h.accountID)
	}

	var meters []*stripe.BillingMeter
	i := meter.List(params)
	for i.Next() {
		meters = append(meters, i.BillingMeter())
	}
	if err := i.Err(); err != nil {
		return nil, fmt.Errorf("failed to list meters: %w", err)
	}
	return meters, nil
}

// DeactivateMeter deactivates a meter in Stripe and returns a MeterChange for response
func (h *MeterHandler) DeactivateMeter(ctx context.Context, stripeID string) (*models.MeterChange, error) {
	// Get meter details before deactivating to include in response
	meterDetails, err := h.GetMeter(ctx, stripeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get meter details before deactivation: %w", err)
	}

	params := &stripe.BillingMeterDeactivateParams{}
	if h.accountID != "" {
		params.SetStripeAccount(h.accountID)
	}
	_, err = meter.Deactivate(stripeID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to deactivate meter %s: %w", stripeID, err)
	}

	// Find the config meter ID from ID mapping
	var configMeterID string
	if h.idMapper != nil {
		// Try to find the config ID from the mapping
		// For now, we'll use the Stripe ID as fallback
		configMeterID = stripeID
	}

	return &models.MeterChange{
		MeterID:     configMeterID,
		DisplayName: meterDetails.DisplayName,
		Action:      "archived",
		StripeID:    stripeID,
	}, nil
}

// ValidateMetersExist checks that all meter references in prices exist
func (h *MeterHandler) ValidateMetersExist(ctx context.Context, config models.StripeConfiguration) error {
	// Create a map of defined meters
	definedMeters := make(map[string]bool)
	for _, meter := range config.Meters {
		definedMeters[meter.ID] = true
	}

	// Check all prices that reference meters
	for _, product := range config.Products {
		for _, price := range product.Prices {
			if price.UsageType == "metered" && price.Meter != "" {
				if !definedMeters[price.Meter] {
					return fmt.Errorf("price %s references undefined meter %s", price.ID, price.Meter)
				}
			}
		}
	}

	return nil
}
