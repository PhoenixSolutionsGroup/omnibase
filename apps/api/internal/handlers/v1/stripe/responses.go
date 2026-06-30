package stripe

import (
	"github.com/google/uuid"

	"api/internal/services/stripe_config"
)

type StripeConfigResponse struct {
	ID        uuid.UUID                         `json:"id" binding:"required"`
	Config    stripe_config.ConfigurationWithIDs `json:"config" binding:"required"`
	Version   string                            `json:"version" binding:"required"`
	CreatedAt string                            `json:"created_at" binding:"required"`
	UpdatedAt string                            `json:"updated_at" binding:"required"`
}
