package middleware

import (
	"api/internal/logger"

	"github.com/gin-gonic/gin"
)

// CORS returns a middleware that handles CORS headers.
// allowedOrigins must be provided. Use "*" to allow all origins (dev only).
func CORS(allowedOrigins []string) gin.HandlerFunc {
	if len(allowedOrigins) == 0 {
		logger.Logger.Error("CORS_ALLOWED_ORIGINS is required but not set")
		panic("CORS_ALLOWED_ORIGINS environment variable must be set")
	}

	allowAll := len(allowedOrigins) == 1 && allowedOrigins[0] == "*"
	originSet := make(map[string]bool, len(allowedOrigins))
	if !allowAll {
		for _, o := range allowedOrigins {
			originSet[o] = true
		}
	}

	logger.Logger.Debug("CORS middleware initialized", "allowed_origins", allowedOrigins, "allow_all", allowAll)

	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		path := c.Request.URL.Path

		if origin != "" {
			if allowAll || originSet[origin] {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Credentials", "true")
				logger.Logger.Debug("CORS headers set for origin",
					"origin", origin,
					"path", path,
				)
			} else {
				logger.Logger.Debug("CORS request from non-whitelisted origin blocked",
					"origin", origin,
					"path", path,
				)
			}
		}

		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			logger.Logger.Debug("CORS preflight request handled",
				"origin", origin,
				"path", path,
			)
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}
