package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	v1 "api/internal/handlers/v1"
	"api/internal/handlers/v1/tenants/invites"
	"api/internal/handlers/v1/tenants/lifecycle"
	"api/internal/handlers/v1/tenants/roles"
	"api/internal/handlers/v1/tenants/subscriptions"
	"api/internal/handlers/v1/tenants/users"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/auth"
	"api/internal/services/billing"
	"api/internal/services/email"
	"api/internal/services/permissions"
	"api/internal/services/permissions/rbac"
	"api/internal/services/stripe_client"
	"api/internal/services/tenants"

	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing tenant routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)
	perms := permissions.New(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)
	authSvc := auth.New(auth.Deps{AdminURL: cfg.AuthConfig.AuthAdminURL})
	tenantsSvc := tenants.New(tenants.Deps{Repo: repo, Auth: authSvc, SigningKey: cfg.Database.SigningKey})
	rbacSvc := rbac.New(rbac.Deps{Repo: repo, Perms: perms})
	emailSvc, err := email.New(email.Deps{
		Repo:          repo,
		ConnectionURI: cfg.SMTPConfig.ConnectionURI,
		DefaultFrom:   cfg.SMTPConfig.FromEmail,
	})
	if err != nil {
		logger.Logger.Error("Failed to initialize email service", "error", err)
		panic(err)
	}

	tenantHandler := v1.NewTenantHandler(cfg)
	rolesHandler := roles.New(roles.Deps{Repo: repo, Perms: perms})
	usersHandler := users.New(users.Deps{
		Repo:    repo,
		Perms:   perms,
		Auth:    authSvc,
		RBAC:    rbacSvc,
		Tenants: tenantsSvc,
	})
	invitesHandler := invites.New(invites.Deps{
		Repo:    repo,
		Perms:   perms,
		Auth:    authSvc,
		RBAC:    rbacSvc,
		Tenants: tenantsSvc,
		Email:   emailSvc,
	})
	stripeClient := stripe_client.New(cfg.StripeConfig)
	billingSvc := billing.New(billing.Deps{
		Repo:   repo,
		Stripe: stripeClient,
		FeePct: cfg.StripeConfig.PlatformFeePercent,
	})
	lifecycleHandler := lifecycle.New(lifecycle.Deps{
		Repo:    repo,
		Tenants: tenantsSvc,
		Billing: billingSvc,
		RBAC:    rbacSvc,
		Perms:   perms,
		Auth:    authSvc,
	})
	subscriptionsHandler := subscriptions.New(subscriptions.Deps{
		Repo:    repo,
		Billing: billingSvc,
	})
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Service-key only routes (lookup endpoints for service-to-service calls)
	serviceKeyOnly := router.Group("")
	serviceKeyOnly.Use(authMiddleware.RequireServiceKey())
	serviceKeyOnly.GET("/by-id/:tenant_id", tenantHandler.GetTenantByID)
	serviceKeyOnly.GET("/by-stripe-customer/:stripe_customer_id", tenantHandler.GetTenantByStripeCustomerID)

	// Routes that accept session OR service key auth
	authenticated := router.Group("")
	authenticated.Use(authMiddleware.RequireAuthHeaders())
	authenticated.Use(authMiddleware.RequireSessionOrServiceKey())

	authenticated.GET("/jwt", lifecycleHandler.GetJWT)

	authenticated.GET("/users", usersHandler.List)

	authenticated.GET("/subscriptions", subscriptionsHandler.List)

	authenticated.GET("/subscriptions/:config_price_id", subscriptionsHandler.Get)

	authenticated.DELETE("/subscriptions", subscriptionsHandler.Remove)

	authenticated.POST("/subscriptions", subscriptionsHandler.Add)

	authenticated.GET("/billing-status", subscriptionsHandler.BillingStatus)

	authenticated.POST("", lifecycleHandler.CreateTenant)

	authenticated.POST("/invites", invitesHandler.Create)

	authenticated.PUT("/users", usersHandler.UpdateRole)

	authenticated.PUT("/invites/accept", invitesHandler.Accept)

	authenticated.PUT("/switch-active", lifecycleHandler.SwitchActive)

	authenticated.DELETE("", lifecycleHandler.DeleteTenant)

	authenticated.DELETE("/users", usersHandler.Delete)

	authenticated.GET("/roles", rolesHandler.ListRoles)

	authenticated.GET("/roles/definitions", rolesHandler.ListDefinitions)

	authenticated.POST("/roles", rolesHandler.CreateRole)

	authenticated.PUT("/roles/:role_id", rolesHandler.UpdateRole)

	authenticated.DELETE("/roles/:role_id", rolesHandler.DeleteRole)
}
