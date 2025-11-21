package stripe_config

import (
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IDMapper struct {
	db *gorm.DB
}

func NewIDMapper(db *gorm.DB) *IDMapper {
	return &IDMapper{
		db: db,
	}
}

func (m *IDMapper) SaveIDMapping(configID uuid.UUID, configItemID string, stripeID string, itemType string) error {
	logger.Logger.Debug("Saving ID mapping",
		"configID", configID,
		"configItemID", configItemID,
		"stripeID", stripeID,
		"itemType", itemType)

	// Check if a mapping already exists
	var existing models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		// Create new mapping
		logger.Logger.Debug("Creating new ID mapping", "configItemID", configItemID, "itemType", itemType)
		mapping := &models.StripeIDMapping{
			ConfigID:        configID,
			ConfigItemID:    configItemID,
			StripeID:        stripeID,
			ItemType:        itemType,
			StripeIDHistory: []string{stripeID},
		}
		err := m.db.Create(mapping).Error
		if err != nil {
			logger.Logger.Error("Failed to create ID mapping", "error", err, "configItemID", configItemID)
			return err
		}
		logger.Logger.Info("ID mapping created successfully", "configItemID", configItemID, "stripeID", stripeID)
		return nil
	} else if err != nil {
		logger.Logger.Error("Failed to check existing mapping", "error", err, "configItemID", configItemID)
		return fmt.Errorf("failed to check existing mapping: %w", err)
	}

	// Update existing mapping - append new stripe_id to history
	logger.Logger.Debug("Updating existing ID mapping", "configItemID", configItemID, "oldStripeID", existing.StripeID, "newStripeID", stripeID)
	existing.StripeIDHistory = append(existing.StripeIDHistory, stripeID)
	existing.StripeID = stripeID
	existing.ConfigID = configID

	err = m.db.Save(&existing).Error
	if err != nil {
		logger.Logger.Error("Failed to update ID mapping", "error", err, "configItemID", configItemID)
		return err
	}
	logger.Logger.Info("ID mapping updated successfully", "configItemID", configItemID, "stripeID", stripeID)
	return nil
}

func (m *IDMapper) GetStripeIDByConfigItemID(configItemID string, itemType string) (string, error) {
	logger.Logger.Trace("Getting Stripe ID by config item ID", "configItemID", configItemID, "itemType", itemType)

	var mapping models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Debug("No ID mapping found", "configItemID", configItemID, "itemType", itemType)
			return "", nil // No mapping found
		}
		logger.Logger.Error("Failed to fetch stripe ID mapping", "error", err, "configItemID", configItemID)
		return "", fmt.Errorf("failed to fetch stripe ID mapping: %w", err)
	}

	logger.Logger.Trace("Stripe ID found", "configItemID", configItemID, "stripeID", mapping.StripeID)
	return mapping.StripeID, nil
}

// GetMappingByConfigItemID returns the mapping for a config item ID, or nil if not found
func (m *IDMapper) GetMappingByConfigItemID(configItemID string, itemType string) (*models.StripeIDMapping, error) {
	logger.Logger.Trace("Getting mapping by config item ID", "configItemID", configItemID, "itemType", itemType)

	var mapping models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Debug("No mapping found", "configItemID", configItemID, "itemType", itemType)
			return nil, nil // No mapping found
		}
		logger.Logger.Error("Failed to fetch mapping", "error", err, "configItemID", configItemID)
		return nil, fmt.Errorf("failed to fetch mapping: %w", err)
	}

	logger.Logger.Trace("Mapping found", "configItemID", configItemID, "stripeID", mapping.StripeID)
	return &mapping, nil
}

func (m *IDMapper) UpdateIDMapping(configItemID string, newStripeID string, itemType string) error {
	logger.Logger.Debug("Updating ID mapping", "configItemID", configItemID, "newStripeID", newStripeID, "itemType", itemType)

	// First, get the current mapping to access stripe_id and stripe_id_history
	var currentMapping models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		First(&currentMapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Warn("No existing mapping found for update", "configItemID", configItemID, "itemType", itemType)
			return nil // No existing mapping found, this might be a new price - that's ok
		}
		logger.Logger.Error("Failed to fetch current mapping", "error", err, "configItemID", configItemID)
		return fmt.Errorf("failed to fetch current mapping: %w", err)
	}

	// Build updated history array
	updatedHistory := currentMapping.StripeIDHistory

	// Append old stripe_id to history if it's different from new one and not empty
	if currentMapping.StripeID != newStripeID && currentMapping.StripeID != "" {
		updatedHistory = append(updatedHistory, currentMapping.StripeID)
		logger.Logger.Debug("Adding old Stripe ID to history", "oldStripeID", currentMapping.StripeID)
	}

	// Also append the NEW stripe_id to history
	updatedHistory = append(updatedHistory, newStripeID)

	// Update both stripe_id and stripe_id_history
	result := m.db.Model(&models.StripeIDMapping{}).
		Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		Updates(map[string]interface{}{
			"stripe_id":         newStripeID,
			"stripe_id_history": updatedHistory,
		})

	if result.Error != nil {
		logger.Logger.Error("Failed to update ID mapping", "error", result.Error, "configItemID", configItemID)
		return fmt.Errorf("failed to update ID mapping: %w", result.Error)
	}

	logger.Logger.Info("ID mapping updated successfully", "configItemID", configItemID, "newStripeID", newStripeID)
	return nil
}
