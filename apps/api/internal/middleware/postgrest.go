package middleware

import (
	"api/internal/handlers"
	"strings"

	"github.com/gin-gonic/gin"
)

type PostgrestMiddleware struct {
}

func NewPostgrestMiddleware() *PostgrestMiddleware {
	return &PostgrestMiddleware{}
}

func (m *PostgrestMiddleware) PostgRESTJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		var jwt string

		// Priority 1: Check header first (for API clients)
		if token := c.GetHeader("X-Postgrest-Token"); token != "" {
			jwt = token
		}

		// Priority 2: Check Authorization header
		if jwt == "" {
			if auth := c.GetHeader("Authorization"); strings.HasPrefix(auth, "Bearer ") {
				jwt = strings.TrimPrefix(auth, "Bearer ")
			}
		}

		// Priority 3: Check cookie (for browser clients)
		if jwt == "" {
			cookieHeader := c.GetHeader("Cookie")
			jwt = extractJWTFromCookie(cookieHeader)
		}

		// Store in context for handlers to access
		if jwt == "" {
			handlers.NewUnauthorizedResponse(c, "Missing or invalid JWT")
			return
		}
		c.Set("omnibase_postgrest_jwt", jwt)

		c.Next()
	}
}

// Helper: Extract JWT from cookie header
func extractJWTFromCookie(cookieHeader string) string {
	cookies := strings.Split(cookieHeader, "; ")
	for _, cookie := range cookies {
		parts := strings.SplitN(cookie, "=", 2)
		if len(parts) == 2 && parts[0] == "omnibase_postgrest_jwt" {
			return parts[1]
		}
	}
	return ""
}
