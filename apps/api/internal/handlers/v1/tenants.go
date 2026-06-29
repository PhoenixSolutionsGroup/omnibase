package v1

import (
	"api/internal/config"
	"api/internal/handlers/v1/tenants"
)

func NewTenantHandler(cfg *config.Config) *tenants.Handler {
	return tenants.New(cfg)
}
