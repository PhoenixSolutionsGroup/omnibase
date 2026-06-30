package email

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var ListTemplatesError = errors.New("Failed to fetch templates")

type ListTemplatesResponse struct {
	Templates []repository.EmailTemplate `json:"templates"`
	Count     int                        `json:"count"`
}

func (h *Handler) ListTemplates(ctx *gin.Context) {
	rows, err := h.repo.ListEmailTemplates(ctx.Request.Context())
	if err != nil {
		logger.Logger.Error("Failed to fetch email templates", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ListTemplatesError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, ListTemplatesResponse{
		Templates: rows,
		Count:     len(rows),
	})
}
