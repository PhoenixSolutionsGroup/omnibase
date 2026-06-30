package auth

import (
	"errors"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var GetSessionError = errors.New("Failed to get session")

type SessionResponse struct {
	Session  *kratos.Session              `json:"session" binding:"required"`
	Identity *kratos.Identity             `json:"identity" binding:"required"`
	Tenant   *repository.GetTenantByIDRow `json:"tenant,omitempty"`
}

func (h *Handler) GetSession(c *gin.Context) {
	session := c.MustGet("session").(*kratos.Session)
	identity := c.MustGet("identity").(*kratos.Identity)
	tenantID, hasTenant := c.Get("tenant_id")

	resp := SessionResponse{
		Session:  session,
		Identity: identity,
	}

	if hasTenant {
		tenant, err := h.repo.GetTenantByID(c.Request.Context(), tenantID.(string))
		if err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", tenantID, "error", err)
		} else {
			resp.Tenant = &tenant
		}
	}

	handlers.NewSuccessResponse(c, resp)
}
