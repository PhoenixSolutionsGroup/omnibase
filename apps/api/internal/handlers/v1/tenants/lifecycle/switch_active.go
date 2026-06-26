package lifecycle

import (
	"errors"
	"fmt"

	"api/internal/handlers"
	"api/internal/services/tenants"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var SwitchActiveError = errors.New("Failed to switch active tenant")

type SwitchActiveRequest struct {
	TenantID string `json:"tenant_id" binding:"required,uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type SwitchActiveResponse struct {
	Token   string `json:"token"   example:"eyJhbGciOiJIUzI1NiIs..."`
	Message string `json:"message" example:"Successfully switched tenants"`
}

func (h *Handler) SwitchActive(c *gin.Context) {
	userUuid := handlers.User(c)

	var req SwitchActiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, "Invalid request format")
		return
	}

	tenantUuid, err := uuid.Parse(req.TenantID)
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid tenant_id")
		return
	}

	token, err := h.tenants.SetActive(c.Request.Context(), userUuid, tenantUuid)
	if err != nil {
		if errors.Is(err, tenants.NotTenantMemberError) {
			handlers.NewNotFoundResponse(c, "Tenant not found or you don't have access to it")
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", SwitchActiveError, err))
		return
	}

	handlers.NewSuccessResponse(c, SwitchActiveResponse{
		Token:   token,
		Message: "Successfully switched tenants",
	})
}
