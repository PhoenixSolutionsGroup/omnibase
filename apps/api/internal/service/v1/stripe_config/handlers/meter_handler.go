package handlers

import (
	"context"
	"fmt"
	"strings"

	"api/internal/logger"
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
	logger.Logger.Info("Creating Stripe meter",
		"meterID", meterConfig.ID,
		"displayName", meterConfig.DisplayName,
		"eventName", meterConfig.EventName)

	// Check if stripe_id is provided for migration support
	if meterConfig.StripeID != "" {
		logger.Logger.Info("Meter has stripe_id, checking for existing mapping",
			"meterID", meterConfig.ID,
			"stripeID", meterConfig.StripeID)

		// Check if mapping already exists for this config_id
		existingMapping, err := h.idMapper.GetMappingByConfigItemID(meterConfig.ID, "meter")

		if err != nil {
			return "", fmt.Errorf("failed to check existing mapping: %w", err)
		}

		if existingMapping != nil {
			// Mapping exists - SKIP and return the existing Stripe ID
			logger.Logger.Info("Skipped meter - stripe_id already linked",
				"meterID", meterConfig.ID,
				"existingStripeID", existingMapping.StripeID)

			return existingMapping.StripeID, nil
		}

		// No mapping exists - CREATE mapping with provided stripe_id
		logger.Logger.Info("Creating stripe_id mapping from config",
			"meterID", meterConfig.ID,
			"stripeID", meterConfig.StripeID)

		if configID != uuid.Nil && h.idMapper != nil {
			if err := h.idMapper.SaveIDMapping(configID, meterConfig.ID, meterConfig.StripeID, "meter"); err != nil {
				return "", fmt.Errorf("failed to create meter mapping: %w", err)
			}
		}

		return meterConfig.StripeID, nil
	}

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

	ApplyConnectAccount(h.accountID, params)

	logger.Logger.Info("Making Stripe API call to create meter", "meterID", meterConfig.ID)
	result, err := meter.New(params)
	if err != nil {
		// Check if meter already exists - handle idempotently
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceAlreadyExists {
			logger.Logger.Info("Meter already exists in Stripe, finding existing meter", "meterID", meterConfig.ID, "eventName", meterConfig.EventName)
			existingMeter, findErr := h.findMeterByEventName(meterConfig.EventName)
			if findErr != nil {
				logger.Logger.Error("Failed to find existing meter", "error", findErr, "eventName", meterConfig.EventName)
				return "", fmt.Errorf("meter already exists but failed to find it: %w", findErr)
			}
			if existingMeter != nil {
				logger.Logger.Info("Found existing meter, saving mapping", "meterID", meterConfig.ID, "stripeID", existingMeter.ID)
				if configID != uuid.Nil && h.idMapper != nil {
					if err := h.idMapper.SaveIDMapping(configID, meterConfig.ID, existingMeter.ID, "meter"); err != nil {
						logger.Logger.Error("Failed to save meter ID mapping", "error", err, "meterID", meterConfig.ID)
						return "", fmt.Errorf("failed to save meter ID mapping: %w", err)
					}
				}
				return existingMeter.ID, nil
			}
		}
		// Also check for the specific error message about active meter (case-insensitive)
		if stripeErr, ok := err.(*stripe.Error); ok && strings.Contains(strings.ToLower(stripeErr.Msg), "active meter already exists") {
			logger.Logger.Info("Active meter already exists, finding existing meter", "meterID", meterConfig.ID, "eventName", meterConfig.EventName)
			existingMeter, findErr := h.findMeterByEventName(meterConfig.EventName)
			if findErr != nil {
				logger.Logger.Error("Failed to find existing meter", "error", findErr, "eventName", meterConfig.EventName)
				return "", fmt.Errorf("meter already exists but failed to find it: %w", findErr)
			}
			if existingMeter != nil {
				logger.Logger.Info("Found existing meter, saving mapping", "meterID", meterConfig.ID, "stripeID", existingMeter.ID)
				if configID != uuid.Nil && h.idMapper != nil {
					if err := h.idMapper.SaveIDMapping(configID, meterConfig.ID, existingMeter.ID, "meter"); err != nil {
						logger.Logger.Error("Failed to save meter ID mapping", "error", err, "meterID", meterConfig.ID)
						return "", fmt.Errorf("failed to save meter ID mapping: %w", err)
					}
				}
				return existingMeter.ID, nil
			}
		}
		logger.Logger.Error("Failed to create Stripe meter", "error", err, "meterID", meterConfig.ID)
		return "", fmt.Errorf("failed to create meter %s: %w", meterConfig.ID, err)
	}

	logger.Logger.Info("Stripe meter created successfully", "configMeterID", meterConfig.ID, "stripeID", result.ID)

	// Save meter ID mapping if we have config ID and idMapper
	if configID != uuid.Nil && h.idMapper != nil {
		if err := h.idMapper.SaveIDMapping(configID, meterConfig.ID, result.ID, "meter"); err != nil {
			logger.Logger.Error("Failed to save meter ID mapping", "error", err, "meterID", meterConfig.ID)
			return "", fmt.Errorf("failed to save meter ID mapping: %w", err)
		}
	}

	return result.ID, nil
}

// GetMeter retrieves a meter from Stripe using v82 API
func (h *MeterHandler) GetMeter(ctx context.Context, stripeID string) (*stripe.BillingMeter, error) {
	logger.Logger.Debug("Getting Stripe meter", "stripeID", stripeID)

	params := &stripe.BillingMeterParams{}
	ApplyConnectAccount(h.accountID, params)

	logger.Logger.Info("Making Stripe API call to get meter", "stripeID", stripeID)
	result, err := meter.Get(stripeID, params)
	if err != nil {
		logger.Logger.Error("Failed to get Stripe meter", "error", err, "stripeID", stripeID)
		return nil, fmt.Errorf("failed to get meter %s: %w", stripeID, err)
	}

	logger.Logger.Debug("Stripe meter retrieved successfully", "stripeID", stripeID)
	return result, nil
}

// UpdateMeter updates a meter in Stripe using v82 API (meters have limited update capabilities)
func (h *MeterHandler) UpdateMeter(ctx context.Context, stripeID string, meterConfig models.Meter) error {
	logger.Logger.Info("Updating Stripe meter", "stripeID", stripeID, "displayName", meterConfig.DisplayName)

	params := &stripe.BillingMeterParams{
		DisplayName: stripe.String(meterConfig.DisplayName),
	}
	ApplyConnectAccount(h.accountID, params)

	logger.Logger.Info("Making Stripe API call to update meter", "stripeID", stripeID)
	_, err := meter.Update(stripeID, params)
	if err != nil {
		logger.Logger.Error("Failed to update Stripe meter", "error", err, "stripeID", stripeID)
		return fmt.Errorf("failed to update meter %s: %w", stripeID, err)
	}

	logger.Logger.Info("Stripe meter updated successfully", "stripeID", stripeID)
	return nil
}

// ListMeters lists all meters using v82 API
func (h *MeterHandler) ListMeters(ctx context.Context) ([]*stripe.BillingMeter, error) {
	logger.Logger.Debug("Listing Stripe meters")

	params := &stripe.BillingMeterListParams{}
	ApplyConnectAccount(h.accountID, params)

	logger.Logger.Info("Making Stripe API call to list meters")
	var meters []*stripe.BillingMeter
	i := meter.List(params)
	for i.Next() {
		meters = append(meters, i.BillingMeter())
	}
	if err := i.Err(); err != nil {
		logger.Logger.Error("Failed to list Stripe meters", "error", err)
		return nil, fmt.Errorf("failed to list meters: %w", err)
	}

	logger.Logger.Info("Stripe meters listed successfully", "count", len(meters))
	return meters, nil
}

// DeactivateMeter deactivates a meter in Stripe and returns a MeterChange for response
// Idempotent: returns success if meter is already deactivated
func (h *MeterHandler) DeactivateMeter(ctx context.Context, stripeID string) (*models.MeterChange, error) {
	logger.Logger.Info("Deactivating Stripe meter", "stripeID", stripeID)

	// Get meter details before deactivating to include in response
	meterDetails, err := h.GetMeter(ctx, stripeID)
	if err != nil {
		logger.Logger.Error("Failed to get meter details before deactivation", "error", err, "stripeID", stripeID)
		return nil, fmt.Errorf("failed to get meter details before deactivation: %w", err)
	}

	params := &stripe.BillingMeterDeactivateParams{}
	ApplyConnectAccount(h.accountID, params)

	logger.Logger.Info("Making Stripe API call to deactivate meter", "stripeID", stripeID)
	_, err = meter.Deactivate(stripeID, params)
	if err != nil {
		// Check if meter is already deactivated - treat as success (idempotent)
		if stripeErr, ok := err.(*stripe.Error); ok {
			// Stripe returns "meter_already_deactivated" in the Msg field
			if stripeErr.Msg == "meter_already_deactivated" {
				logger.Logger.Info("Meter already deactivated, treating as success", "stripeID", stripeID)
				// Continue to return success with meter details
			} else {
				logger.Logger.Error("Failed to deactivate Stripe meter", "error", err, "stripeID", stripeID)
				return nil, fmt.Errorf("failed to deactivate meter %s: %w", stripeID, err)
			}
		} else {
			logger.Logger.Error("Failed to deactivate Stripe meter", "error", err, "stripeID", stripeID)
			return nil, fmt.Errorf("failed to deactivate meter %s: %w", stripeID, err)
		}
	} else {
		logger.Logger.Info("Stripe meter deactivated successfully", "stripeID", stripeID)
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
	logger.Logger.Debug("Validating meter existence", "meterCount", len(config.Meters))

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
					logger.Logger.Error("Price references undefined meter", "priceID", price.ID, "meterID", price.Meter)
					return fmt.Errorf("price %s references undefined meter %s", price.ID, price.Meter)
				}
			}
		}
	}

	logger.Logger.Debug("All meter references validated successfully")
	return nil
}

// findMeterByEventName finds an existing meter by its event name
func (h *MeterHandler) findMeterByEventName(eventName string) (*stripe.BillingMeter, error) {
	logger.Logger.Debug("Finding meter by event name", "eventName", eventName)

	params := &stripe.BillingMeterListParams{}
	params.Filters.AddFilter("status", "", "active")
	ApplyConnectAccount(h.accountID, params)

	iter := meter.List(params)
	for iter.Next() {
		m := iter.BillingMeter()
		if m.EventName == eventName {
			logger.Logger.Debug("Found meter by event name", "eventName", eventName, "stripeID", m.ID)
			return m, nil
		}
	}
	if err := iter.Err(); err != nil {
		logger.Logger.Error("Error listing meters", "error", err)
		return nil, fmt.Errorf("failed to list meters: %w", err)
	}

	logger.Logger.Warn("Meter not found by event name", "eventName", eventName)
	return nil, nil
}
