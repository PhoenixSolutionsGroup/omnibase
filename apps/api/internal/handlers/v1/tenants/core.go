package tenants

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/service"
	services_v1 "api/internal/service/v1"
	"fmt"

	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"
)

type TenantHandler struct {
	db      *gorm.DB
	cfg     *config.Config
	email   *service.EmailService
	stripe  *services_v1.StripeService
	tenants *services_v1.TenantsService
	keto    *services_v1.KetoService
}

func NewTenantHandler(cfg *config.Config) *TenantHandler {
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	stripe.Key = cfg.StripeConfig.SecretKey

	emailService, err := service.NewEmailService(cfg.SMTPConfig.ConnectionURI, cfg.SMTPConfig.FromEmail, db)
	if err != nil {
		panic(fmt.Errorf("failed to initialize email service: %w", err))
	}

	stripeService := services_v1.NewStripeService(cfg, db)
	tenantsService := services_v1.NewTenantsService(db, cfg)
	ketoService := services_v1.NewKetoService(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)

	return &TenantHandler{
		db:      db,
		cfg:     cfg,
		email:   emailService,
		stripe:  stripeService,
		tenants: tenantsService,
		keto:    ketoService,
	}
}
