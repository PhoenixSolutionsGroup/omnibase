package auth

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var ListTenantsError = errors.New("Failed to list tenants")

type UserTenantListItem struct {
	IsActive bool                          `json:"is_active" binding:"required" example:"true"`
	Tenant   repository.GetTenantByIDRow   `json:"tenant" binding:"required"`
}

type ListTenantsResponse struct {
	Tenants []UserTenantListItem `json:"tenants" binding:"required"`
}

func (h *Handler) ListTenants(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(c, "UserID not found in context")
		return
	}

	rows, err := h.repo.ListTenantsForUser(c.Request.Context(), userID)
	if err != nil {
		logger.Logger.Error("Failed to list tenants for user", "user_id", userID, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ListTenantsError, err))
		return
	}

	items := make([]UserTenantListItem, 0, len(rows))
	for _, r := range rows {
		items = append(items, UserTenantListItem{
			IsActive: r.IsActive,
			Tenant: repository.GetTenantByIDRow{
				ID:                 r.ID,
				Name:               r.Name,
				StripeCustomerID:   r.StripeCustomerID,
				EnterpriseTemplate: r.EnterpriseTemplate,
				EnterpriseID:       r.EnterpriseID,
				Type:               r.Type,
				CreatedAt:          r.CreatedAt,
				UpdatedAt:          r.UpdatedAt,
			},
		})
	}

	handlers.NewSuccessResponse(c, ListTenantsResponse{Tenants: items})
}
