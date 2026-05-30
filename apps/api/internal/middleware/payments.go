package middleware

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type PaymentsMiddleware struct {
	kratosClient *kratos.APIClient
	db           *gorm.DB
}

func NewPaymentsMiddleware(cfg *config.Config) *PaymentsMiddleware {
	logger.Logger.Debug("Initializing PaymentsMiddleware",
		"kratos_url", cfg.AuthConfig.AuthURL,
	)

	// Public API client for session validation
	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.AuthURL,
		},
	}

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection for PaymentsMiddleware",
			"error", err,
		)
		panic(err)
	}

	logger.Logger.Debug("PaymentsMiddleware initialized successfully")

	return &PaymentsMiddleware{
		kratosClient: kratos.NewAPIClient(publicConfig),
		db:           db,
	}
}

func (m *PaymentsMiddleware) GetCustomerIDFromAuthSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		path := ctx.Request.URL.Path
		method := ctx.Request.Method

		logger.Logger.Debug("GetCustomerIDFromAuthSession middleware executing",
			"method", method,
			"path", path,
		)

		cookieHeader := ctx.GetHeader("Cookie")

		if cookieHeader == "" {
			logger.Logger.Debug("No cookie header present, skipping customer ID lookup",
				"path", path,
			)
			ctx.Next()
			return
		}

		// Pass the cookie header to Kratos for validation
		session, _, err := m.kratosClient.FrontendAPI.ToSession(ctx.Request.Context()).
			Cookie(cookieHeader).
			Execute()

		if err != nil {
			logger.Logger.Debug("Failed to validate session with Kratos, continuing without authentication",
				"path", path,
				"error", err,
			)
			ctx.Next()
			return
		}

		user_id := session.Identity.GetId()

		// If no user_id, continue to next middleware without failing
		if user_id == "" {
			logger.Logger.Debug("No user_id found in session",
				"path", path,
			)
			ctx.Next()
			return
		}

		logger.Logger.Debug("User authenticated, querying for stripe customer ID",
			"user_id", user_id,
			"path", path,
		)

		// Query tenant_users joined with tenants in a single DB call
		var stripe_customer_id *string
		err = m.db.Table("auth.tenant_users tu").
			Select("t.stripe_customer_id").
			Joins("INNER JOIN auth.tenants t ON t.id = tu.tenant_id").
			Where("tu.user_id = ? AND tu.is_active = true", user_id).
			Scan(&stripe_customer_id).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				logger.Logger.Debug("No active tenant found for user",
					"user_id", user_id,
					"path", path,
				)
				// No active tenant found, continue without setting stripe_customer_id
				ctx.Next()
				return
			}
			logger.Logger.Error("Error querying tenant and stripe_customer_id",
				"user_id", user_id,
				"path", path,
				"error", err,
			)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("database error: %w", err))
			return
		}

		// Check if we found a result
		if stripe_customer_id == nil {
			logger.Logger.Debug("No stripe_customer_id found for user",
				"user_id", user_id,
				"path", path,
			)
			// No active tenant found, continue without setting stripe_customer_id
			ctx.Next()
			return
		}

		// If tenant exists but has no stripe_customer_id, this is an error condition
		if stripe_customer_id == nil || *stripe_customer_id == "" {
			logger.Logger.Warn("Tenant exists but has no Stripe customer ID configured",
				"user_id", user_id,
				"path", path,
			)
			handlers.NewBadRequestResponse(ctx, "Tenant has no Stripe customer ID configured")
			return
		}

		// Set the stripe_customer_id in context
		logger.Logger.Debug("Stripe customer ID set in context",
			"user_id", user_id,
			"stripe_customer_id", *stripe_customer_id,
			"path", path,
		)
		ctx.Set("stripe_customer_id", *stripe_customer_id)
		ctx.Next()
	}
}

// GetCustomerIDFromTenant retrieves stripe_customer_id from tenant_id context
func (m *PaymentsMiddleware) GetCustomerIDFromTenant() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		path := ctx.Request.URL.Path
		method := ctx.Request.Method

		logger.Logger.Debug("GetCustomerIDFromTenant middleware executing",
			"method", method,
			"path", path,
		)

		// Check if stripe_customer_id is already set (from previous middleware)
		if _, exists := ctx.Get("stripe_customer_id"); exists {
			logger.Logger.Debug("stripe_customer_id already set in context, skipping tenant lookup",
				"path", path,
			)
			ctx.Next()
			return
		}

		// Get tenant_id from context (set by auth middleware when using service key)
		tenantIDVal, exists := ctx.Get("tenant_id")
		if !exists {
			logger.Logger.Debug("No tenant_id in context, skipping",
				"path", path,
			)
			ctx.Next()
			return
		}

		tenantID, ok := tenantIDVal.(string)
		if !ok || tenantID == "" {
			logger.Logger.Debug("Invalid tenant_id in context",
				"path", path,
			)
			ctx.Next()
			return
		}

		logger.Logger.Debug("Looking up stripe_customer_id for tenant",
			"tenant_id", tenantID,
			"path", path,
		)

		// Query tenant for stripe_customer_id
		var stripeCustomerID *string
		err := m.db.Table("auth.tenants").
			Select("stripe_customer_id").
			Where("id = ?", tenantID).
			Scan(&stripeCustomerID).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				logger.Logger.Warn("Tenant not found",
					"tenant_id", tenantID,
					"path", path,
				)
				ctx.Next()
				return
			}
			logger.Logger.Error("Error querying tenant for stripe_customer_id",
				"tenant_id", tenantID,
				"path", path,
				"error", err,
			)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("database error: %w", err))
			return
		}

		// If tenant has no stripe_customer_id, continue without setting it
		if stripeCustomerID == nil || *stripeCustomerID == "" {
			logger.Logger.Debug("Tenant has no stripe_customer_id configured",
				"tenant_id", tenantID,
				"path", path,
			)
			ctx.Next()
			return
		}

		// Set the stripe_customer_id in context
		logger.Logger.Debug("Stripe customer ID set in context from tenant",
			"tenant_id", tenantID,
			"stripe_customer_id", *stripeCustomerID,
			"path", path,
		)
		ctx.Set("stripe_customer_id", *stripeCustomerID)
		ctx.Next()
	}
}

func (m *PaymentsMiddleware) GetCustomerIDFromHeader() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		isServiceAuth, exists := ctx.Get("is_service_auth")
		if !exists || isServiceAuth != true {
			ctx.Next()
			return
		}

		stripe_customer_id := ctx.GetHeader("X-Stripe-Customer-Id")
		if stripe_customer_id != "" {
			ctx.Set("stripe_customer_id", stripe_customer_id)
		}
		ctx.Next()
	}
}
