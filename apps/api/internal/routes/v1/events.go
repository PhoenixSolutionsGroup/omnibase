package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"

	"github.com/gin-gonic/gin"
)

var eventsHandler *v1.EventsHandler

// SetUpEventsRoutes sets up the WebSocket events routes
func SetUpEventsRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	// Initialize the events handler singleton
	if eventsHandler == nil {
		eventsHandler = v1.NewEventsHandler(cfg)
	}

	// WebSocket endpoint - no auth middleware here since JWT is sent via WebSocket message
	router.GET("/ws", eventsHandler.HandleWebSocket)
}

// GetEventsHandler returns the singleton events handler instance
// This can be used to gracefully shutdown the handler
func GetEventsHandler() *v1.EventsHandler {
	return eventsHandler
}
