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
	mapping := &models.StripeIDMapping{
		ConfigID:     configID,
		ConfigItemID: configItemID,
		StripeID:     stripeID,
		ItemType:     itemType,
	}
	err := m.db.Create(mapping).Error
	if err != nil {
		return fmt.Errorf("Failed to save ID Mapping: %s", err)
	}
	return nil
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
	result := m.db.Model(&models.StripeIDMapping{}).
		Where("config_item_id = ? AND item_type = ?", configItemID, itemType).
		Update("stripe_id", newStripeID)

	if result.Error != nil {
		return fmt.Errorf("failed to update ID mapping: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		// No existing mapping found, this might be a new price - that's ok
		return nil
	}

	return nil
}
