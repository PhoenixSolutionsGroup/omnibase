package main

import (
	"api/internal/config"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
)

func main() {
	cfg := config.New()
	stripe.Key = cfg.StripeConfig.SecretKey

	r := gin.Default()
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false

	r.Use(middleware.CORS())

	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "healthy",
		})
	})

	v1_group := r.Group("/api/v1")
	v1_routes.InitRoutes(v1_group)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
