package stripe

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
)

var GetSchemaError = errors.New("Failed to load stripe config schema")

type GetSchemaInput struct {
	handlers.AuthCtx
}

type GetSchemaOutput struct {
	ContentType string `header:"Content-Type"`
	Body        []byte
}

func (h *Handler) GetSchema(_ context.Context, _ *GetSchemaInput) (*GetSchemaOutput, error) {
	schemaBytes, err := os.ReadFile("./internal/static/stripe-config-schema.json")
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetSchemaError, err).Error())
	}
	return &GetSchemaOutput{
		ContentType: "application/schema+json",
		Body:        schemaBytes,
	}, nil
}
