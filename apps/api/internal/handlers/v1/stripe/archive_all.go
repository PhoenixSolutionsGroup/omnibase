package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var ArchiveAllConfigError = errors.New("Failed to archive all stripe resources")

type ArchiveAllResponse struct {
	Message       string   `json:"message" binding:"required"`
	ArchivedItems []string `json:"archived_items" binding:"required"`
	ArchiveErrors []string `json:"archive_errors" binding:"required"`
	TotalArchived int      `json:"total_archived" binding:"required"`
	TotalErrors   int      `json:"total_errors" binding:"required"`
	Warning       *string  `json:"warning,omitempty"`
}

func (h *Handler) ArchiveAllConfig(ctx *gin.Context) {
	result, err := h.stripeConfig.ArchiveAll(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ArchiveAllConfigError, err))
		return
	}
	if result.Archived == nil {
		result.Archived = []string{}
	}
	if result.Errors == nil {
		result.Errors = []string{}
	}
	resp := ArchiveAllResponse{
		Message:       "Successfully archived all Stripe resources and cleared local config",
		ArchivedItems: result.Archived,
		ArchiveErrors: result.Errors,
		TotalArchived: len(result.Archived),
		TotalErrors:   len(result.Errors),
	}
	if len(result.Errors) > 0 {
		w := "Some items failed to archive - see archive_errors for details"
		resp.Warning = &w
	}
	handlers.NewSuccessResponse(ctx, resp)
}
