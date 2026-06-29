package stripe

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var GetSchemaError = errors.New("Failed to load stripe config schema")

func (h *Handler) GetSchema(ctx *gin.Context) {
	schemaBytes, err := os.ReadFile("./internal/static/stripe-config-schema.json")
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetSchemaError, err))
		return
	}
	ctx.Data(http.StatusOK, "application/schema+json", schemaBytes)
}
