package tenants

import (
	"errors"

	"api/internal/handlers"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func (h *Handler) GetTenantByID(ctx *gin.Context) {
	tenantID := ctx.Param("tenant_id")
	if tenantID == "" {
		handlers.NewBadRequestResponse(ctx, "tenant_id is required")
		return
	}

	row, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", tenantID)
		handlers.NewInternalServerErrorResponse(ctx, err)
		return
	}

	handlers.NewSuccessResponse(ctx, row)
}
