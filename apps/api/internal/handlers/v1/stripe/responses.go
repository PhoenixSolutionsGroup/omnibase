package stripe

import (
	"github.com/google/uuid"

	"api/internal/services/stripe_config"
)

type StripeConfigResponse struct {
	ID        uuid.UUID                          `json:"id" required:"true"`
	Config    stripe_config.StripeConfigurationWithIDs `json:"config" required:"true"`
	Version   string                             `json:"version" required:"true"`
	CreatedAt string                             `json:"created_at" required:"true"`
	UpdatedAt string                             `json:"updated_at" required:"true"`
}
