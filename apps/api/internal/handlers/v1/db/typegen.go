package db

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
)

var TypegenError = errors.New("Failed to generate types")

var supportedTypegenLanguages = map[string]bool{
	"typescript": true,
	"go":         true,
	"swift":      true,
}

type TypegenInput struct {
	handlers.AuthCtx
	Language string `query:"language"`
	Schemas  string `query:"schemas"`
}

type TypegenOutput struct {
	Status      int
	ContentType string `header:"Content-Type"`
	Body        []byte
}

func (h *Handler) Typegen(_ context.Context, in *TypegenInput) (*TypegenOutput, error) {
	schemas := in.Schemas
	if schemas == "" {
		schemas = "public"
	}
	language := in.Language
	if language == "" {
		language = "typescript"
	}

	if !supportedTypegenLanguages[language] {
		return nil, huma.Error400BadRequest(fmt.Sprintf("Unsupported language: %s. Supported: typescript, go, swift", language))
	}

	url := fmt.Sprintf("%s/generators/%s?included_schemas=%s", h.typegenURL, language, schemas)
	resp, err := http.Get(url)
	if err != nil {
		logger.Logger.Error("Failed to connect to typegen service", "error", err)
		return &TypegenOutput{
			Status:      http.StatusBadGateway,
			ContentType: "application/json",
			Body:        []byte(`{"error":"Failed to connect to typegen service"}`),
		}, nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", TypegenError, err).Error())
	}

	if resp.StatusCode != http.StatusOK {
		return &TypegenOutput{
			Status:      resp.StatusCode,
			ContentType: "application/json",
			Body:        body,
		}, nil
	}

	return &TypegenOutput{
		Status:      http.StatusOK,
		ContentType: "text/plain; charset=utf-8",
		Body:        body,
	}, nil
}
