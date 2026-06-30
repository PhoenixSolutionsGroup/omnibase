package email

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var DeleteTemplateError = errors.New("Failed to delete template")

type DeleteTemplateResponse struct {
	Message string `json:"message"`
}

func (h *Handler) DeleteTemplate(ctx *gin.Context) {
	templateType := ctx.Param("type")

	rows, err := h.repo.DeleteEmailTemplateByType(ctx.Request.Context(), templateType)
	if err != nil {
		logger.Logger.Error("Failed to delete email template", "type", templateType, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTemplateError, err))
		return
	}
	if rows == 0 {
		handlers.NewNotFoundResponse(ctx, "Template not found")
		return
	}

	handlers.NewSuccessResponse(ctx, DeleteTemplateResponse{Message: "Template deleted successfully"})
}
