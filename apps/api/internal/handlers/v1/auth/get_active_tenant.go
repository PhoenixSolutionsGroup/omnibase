package auth

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

type ActiveTenantResponse struct {
	Tenant *repository.GetTenantByIDRow `json:"tenant,omitempty"`
}

func (h *Handler) GetActiveTenant(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(c, "User ID not found in context")
		return
	}

	tenantID, hasTenant := c.Get("tenant_id")
	resp := ActiveTenantResponse{}

	if hasTenant {
		tenant, err := h.repo.GetTenantByID(c.Request.Context(), tenantID.(string))
		if err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", tenantID, "error", err)
		} else {
			resp.Tenant = &tenant
		}
		handlers.NewSuccessResponse(c, resp)
		return
	}

	row, err := h.repo.GetActiveTenantForUser(c.Request.Context(), userID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		logger.Logger.Warn("Failed to fetch active tenant for user", "user_id", userID, "error", err)
	} else if err == nil {
		resp.Tenant = &repository.GetTenantByIDRow{
			ID:                 row.ID,
			Name:               row.Name,
			StripeCustomerID:   row.StripeCustomerID,
			EnterpriseTemplate: row.EnterpriseTemplate,
			EnterpriseID:       row.EnterpriseID,
			Type:               row.Type,
			CreatedAt:          row.CreatedAt,
			UpdatedAt:          row.UpdatedAt,
		}
	}

	handlers.NewSuccessResponse(c, resp)
}
