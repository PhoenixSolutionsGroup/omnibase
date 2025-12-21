package middleware

import (
	"api/internal/logger"

	"github.com/gin-gonic/gin"
)

// CORS returns a middleware that handles CORS headers
func CORS() gin.HandlerFunc {
	logger.Logger.Debug("CORS middleware initialized")

	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		path := c.Request.URL.Path

		// Allow all origins and rely on JWT/session authentication for security
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			logger.Logger.Debug("CORS headers set for origin",
				"origin", origin,
				"path", path,
			)
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
