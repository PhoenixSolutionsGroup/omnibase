package stripe_config

import (
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
	// Check if a mapping already exists
	var existing models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		// Create new mapping
		mapping := &models.StripeIDMapping{
			ConfigID:        configID,
			ConfigItemID:    configItemID,
			StripeID:        stripeID,
			ItemType:        itemType,
			StripeIDHistory: []string{stripeID},
		}
		return m.db.Create(mapping).Error
	} else if err != nil {
		return fmt.Errorf("failed to check existing mapping: %w", err)
	}

	// Update existing mapping - append new stripe_id to history
	existing.StripeIDHistory = append(existing.StripeIDHistory, stripeID)
	existing.StripeID = stripeID
	existing.ConfigID = configID

	return m.db.Save(&existing).Error
}

func (m *IDMapper) GetStripeIDByConfigItemID(configItemID string, itemType string) (string, error) {
	var mapping models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil // No mapping found
		}
		return "", fmt.Errorf("failed to fetch stripe ID mapping: %w", err)
	}

	return mapping.StripeID, nil
}

func (m *IDMapper) UpdateIDMapping(configItemID string, newStripeID string, itemType string) error {
	// First, get the current mapping to access stripe_id and stripe_id_history
	var currentMapping models.StripeIDMapping
	err := m.db.Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		First(&currentMapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil // No existing mapping found, this might be a new price - that's ok
		}
		return fmt.Errorf("failed to fetch current mapping: %w", err)
	}

	// Build updated history array
	updatedHistory := currentMapping.StripeIDHistory

	// Append old stripe_id to history if it's different from new one and not empty
	if currentMapping.StripeID != newStripeID && currentMapping.StripeID != "" {
		updatedHistory = append(updatedHistory, currentMapping.StripeID)
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
		return fmt.Errorf("failed to update ID mapping: %w", result.Error)
	}

	return nil
}
