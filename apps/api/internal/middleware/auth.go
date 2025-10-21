package middleware

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	kratosClient *kratos.APIClient
	db           *gorm.DB
	JWTSecret    string
}

func NewAuthMiddleware(cfg *config.Config) *AuthMiddleware {
	// Public API client for session validation
	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.KratosURL,
		},
	}

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	JWTSecret := cfg.JWTSecret

	return &AuthMiddleware{
		kratosClient: kratos.NewAPIClient(publicConfig),
		db:           db,
		JWTSecret:    JWTSecret,
	}
}

// Low level security - Must be called from user session
func (m *AuthMiddleware) RequireSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieHeader := c.GetHeader("Cookie")

		if cookieHeader == "" {
			handlers.NewUnauthorizedResponse(c, "Authentication required")
			c.Abort()
			return
		}

		// Pass the cookie header to Kratos for validation
		session, _, err := m.kratosClient.FrontendAPI.ToSession(c.Request.Context()).
			Cookie(cookieHeader).
			Execute()

		if err != nil {
			handlers.NewUnauthorizedResponse(c, "Invalid or expired session")
			c.Abort()
			return
		}

		if session.Identity == nil {
			handlers.NewUnauthorizedResponse(c, "No identity found in session")
			c.Abort()
			return
		}

		userID := session.Identity.GetId()
		c.Set("user_id", userID)
		c.Set("session", session)
		c.Set("identity", session.Identity)

		// Query for active tenant_id
		var tenantID string
		err = m.db.Table("auth.tenant_users").
			Select("tenant_id").
			Where("user_id = ? AND is_active = true", userID).
			Scan(&tenantID).Error

		if err == nil && tenantID != "" {
			c.Set("tenant_id", tenantID)
		}

		c.Next()
	}
}

// Top level security - must be called from a backend server w/ JWT
func (m *AuthMiddleware) RequireJWT() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		APIKey := ctx.GetHeader("x-api-key")
		if APIKey != m.JWTSecret {
			handlers.NewUnauthorizedResponse(ctx, "Unauthorized Request")
			return
		}
		ctx.Next()
	}
}
