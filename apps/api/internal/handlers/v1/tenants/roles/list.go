package roles

import (
	"api/internal/handlers"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
)

func (h *Handler) ListRoles(c *gin.Context) {
	tenantUuid := handlers.Tenant(c)
	logger.Logger.Debug("Listing roles for tenant", "tenant_id", tenantUuid)

	roles, err := h.repo.ListRolesByTenant(c.Request.Context(), tenantUuid)
	if err != nil {
		logger.Logger.Error("Failed to list roles", "tenant_id", tenantUuid, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Debug("Successfully listed roles", "tenant_id", tenantUuid, "count", len(roles))
	handlers.NewSuccessResponse(c, roles)
}
