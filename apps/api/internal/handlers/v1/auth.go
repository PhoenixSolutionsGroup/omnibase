package v1

import (
	"api/internal/config"
	"api/internal/handlers"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	targetURL *url.URL
	client    *http.Client
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	targetURL, err := url.Parse(cfg.AuthConfig.KratosURL)
	if err != nil {
		log.Panicf("failed to parse Kratos URL: %s", err)
	}

	return &AuthHandler{
		targetURL: targetURL,
		client:    &http.Client{},
	}
}

func (kp *AuthHandler) ServeIdentitySchema(ctx *gin.Context) {
	schemaPath := "./internal/static/identity.schema.json"
	schemaBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Failed to load schema: %s", err),
		)
		return
	}

	var schema interface{}
	if err := json.Unmarshal(schemaBytes, &schema); err != nil {
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Invalid schema file"),
		)
		return
	}

	ctx.Header("Content-Type", "application/schema+json")
	ctx.JSON(http.StatusOK, schema)
}
