package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"

	"github.com/gin-gonic/gin"
)

func SetUpAuthRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	authHandler := v1.NewAuthHandler(cfg)

	router.GET("/identity-schema", authHandler.ServeIdentitySchema)
}
