package stripe

import (
	"github.com/google/uuid"

	"api/internal/models"
)

type StripeConfigResponse struct {
	ID        uuid.UUID                         `json:"id" binding:"required"`
	Config    models.StripeConfigurationWithIDs `json:"config" binding:"required"`
	Version   string                            `json:"version" binding:"required"`
	CreatedAt string                            `json:"created_at" binding:"required"`
	UpdatedAt string                            `json:"updated_at" binding:"required"`
}
