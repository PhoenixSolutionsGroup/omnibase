package db

import (
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var TypegenError = errors.New("Failed to generate types")

var supportedTypegenLanguages = map[string]bool{
	"typescript": true,
	"go":         true,
	"swift":      true,
}

func (h *Handler) Typegen(c *gin.Context) {
	schemas := c.DefaultQuery("schemas", "public")
	language := c.DefaultQuery("language", "typescript")

	if !supportedTypegenLanguages[language] {
		handlers.NewBadRequestResponse(c, fmt.Sprintf("Unsupported language: %s. Supported: typescript, go, swift", language))
		return
	}

	url := fmt.Sprintf("%s/generators/%s?included_schemas=%s", h.typegenURL, language, schemas)
	resp, err := http.Get(url)
	if err != nil {
		logger.Logger.Error("Failed to connect to typegen service", "error", err)
		c.Data(http.StatusBadGateway, "application/json", []byte(`{"error":"Failed to connect to typegen service"}`))
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", TypegenError, err))
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.Data(resp.StatusCode, "application/json", body)
		return
	}

	c.Data(http.StatusOK, "text/plain; charset=utf-8", body)
}
