package middleware

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type PaymentsMiddleware struct {
	kratosClient *kratos.APIClient
	db           *gorm.DB
}

func NewPaymentsMiddleware(cfg *config.Config) *PaymentsMiddleware {
	// Public API client for session validation
	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.KratosURL,
		},
	}

	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	return &PaymentsMiddleware{
		kratosClient: kratos.NewAPIClient(publicConfig),
		db:           db,
	}
}

func (m *PaymentsMiddleware) GetCustomerIDFromAuthSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		cookieHeader := ctx.GetHeader("Cookie")

		if cookieHeader == "" {
			ctx.Next()
			return
		}

		// Pass the cookie header to Kratos for validation
		session, _, err := m.kratosClient.FrontendAPI.ToSession(ctx.Request.Context()).
			Cookie(cookieHeader).
			Execute()

		if err != nil {
			ctx.Next()
			return
		}

		user_id := session.Identity.GetId()

		// If no user_id, continue to next middleware without failing
		if user_id == "" {
			ctx.Next()
			return
		}

		// Query tenant_users joined with tenants in a single DB call
		var stripe_customer_id *string
		err = m.db.Table("auth.tenant_users tu").
			Select("t.stripe_customer_id").
			Joins("INNER JOIN auth.tenants t ON t.id = tu.tenant_id").
			Where("tu.user_id = ? AND tu.is_active = true", user_id).
			Scan(&stripe_customer_id).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// No active tenant found, continue without setting stripe_customer_id
				ctx.Next()
				return
			}
			log.Printf("Error querying tenant and stripe_customer_id: %v", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("database error: %w", err))
			return
		}

		// Check if we found a result
		if stripe_customer_id == nil {
			// No active tenant found, continue without setting stripe_customer_id
			ctx.Next()
			return
		}

		// If tenant exists but has no stripe_customer_id, this is an error condition
		if stripe_customer_id == nil || *stripe_customer_id == "" {
			handlers.NewBadRequestResponse(ctx, "Tenant has no Stripe customer ID configured")
			return
		}

		// Set the stripe_customer_id in context
		ctx.Set("stripe_customer_id", *stripe_customer_id)
		ctx.Next()
	}
}
