package middleware

import (
	"api/internal/logger"
	"time"

	"github.com/gin-gonic/gin"
)

func GinLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log after request is processed
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		errorMessage := c.Errors.ByType(gin.ErrorTypePrivate).String()

		if raw != "" {
			path = path + "?" + raw
		}

		logger.Logger.Info("Completed handling request",
			"http_request", map[string]any{
				"method": method,
				"path":   path,
				"remote": clientIP,
				"scheme": c.Request.URL.Scheme,
			},
			"http_response", map[string]any{
				"status": statusCode,
				"took":   latency.Nanoseconds(),
			},
			"user_agent", c.Request.UserAgent(),
		)

		if errorMessage != "" {
			logger.Logger.Error("request error",
				"error", errorMessage,
				"path", path,
			)
		}
	}
}
