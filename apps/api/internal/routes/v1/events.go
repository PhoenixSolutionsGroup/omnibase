package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
)

var eventsHandler *v1.EventsHandler

// SetUpEventsRoutes sets up the WebSocket events routes
func SetUpEventsRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing events routes")
	cfg := config.New()

	// Initialize the events handler singleton
	if eventsHandler == nil {
		logger.Logger.Debug("Creating events handler singleton instance")
		eventsHandler = v1.NewEventsHandler(cfg)
	} else {
		logger.Logger.Debug("Using existing events handler singleton instance")
	}

	// WebSocket endpoint - no auth middleware here since JWT is sent via WebSocket message
	logger.Logger.Info("Registering GET /ws route for WebSocket connections (JWT auth handled via WebSocket message)")
	router.GET("/ws", eventsHandler.HandleWebSocket)

	logger.Logger.Info("Events routes registration completed")
}

// GetEventsHandler returns the singleton events handler instance
// This can be used to gracefully shutdown the handler
func GetEventsHandler() *v1.EventsHandler {
	return eventsHandler
}
