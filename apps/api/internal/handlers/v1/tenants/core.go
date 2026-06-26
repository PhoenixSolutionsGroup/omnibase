package tenants

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/logger"
	services_v1 "api/internal/service/v1"
	"fmt"

	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"
)

type TenantHandler struct {
	db      *gorm.DB
	repo    repository.Querier
	cfg     *config.Config
	email   *services_v1.EmailService
	stripe  *services_v1.StripeService
	tenants *services_v1.TenantsService
	keto    *services_v1.KetoService
	roles   *services_v1.RolesService
	kratos  *services_v1.KratosService
}

func NewTenantHandler(cfg *config.Config) *TenantHandler {
	logger.Logger.Info("Initializing TenantHandler")
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to connect to database", "error", err)
		panic(err)
	}

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)

	stripe.Key = cfg.StripeConfig.SecretKey

	logger.Logger.Debug("Initializing email service", "from_email", cfg.SMTPConfig.FromEmail)
	emailService, err := services_v1.NewEmailService(cfg.SMTPConfig.ConnectionURI, cfg.SMTPConfig.FromEmail, db)
	if err != nil {
		logger.Logger.Error("Failed to initialize email service", "error", err)
		panic(fmt.Errorf("failed to initialize email service: %w", err))
	}

	logger.Logger.Debug("Initializing tenant services")
	stripeService := services_v1.NewStripeService(cfg, db)
	tenantsService := services_v1.NewTenantsService(db, cfg)
	ketoService := services_v1.NewKetoService(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)
	rolesService := services_v1.NewRolesService(db, ketoService)
	kratosService := services_v1.NewKratosService(cfg.AuthConfig.AuthAdminURL)

	logger.Logger.Info("TenantHandler initialized successfully")
	return &TenantHandler{
		db:      db,
		repo:    repo,
		cfg:     cfg,
		email:   emailService,
		stripe:  stripeService,
		tenants: tenantsService,
		keto:    ketoService,
		roles:   rolesService,
		kratos:  kratosService,
	}
}
