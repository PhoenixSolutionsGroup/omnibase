package invites

import (
	"errors"
	"fmt"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var (
	AcceptError       = errors.New("Failed to accept invite")
	InviteInvalidError = errors.New("Invalid or expired invite token")
	EmailMismatchError = errors.New("This invite was sent to a different email address")
)

type AcceptRequest struct {
	Token string `json:"token" binding:"required" example:"tok_test_abc123xyz"`
}

type AcceptResponse struct {
	TenantID string `json:"tenant_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Token    string `json:"token"     example:"eyJhbGciOiJIUzI1NiIs..."`
	Message  string `json:"message"   example:"Successfully joined organization"`
}

func (h *Handler) Accept(c *gin.Context) {
	userUuid := handlers.User(c)

	var req AcceptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, "Invalid request format")
		return
	}

	invite, err := h.repo.GetActiveInviteByToken(c.Request.Context(), req.Token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewBadRequestResponse(c, InviteInvalidError.Error())
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}

	identities, err := h.auth.GetIdentities(c.Request.Context(), []string{userUuid.String()})
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}
	caller, ok := identities[userUuid.String()]
	if !ok || caller.Email == "" {
		handlers.NewBadRequestResponse(c, "Email not found for caller identity")
		return
	}
	if caller.Email != invite.Email {
		handlers.NewForbiddenResponse(c, EmailMismatchError.Error())
		return
	}

	tenantUuid, err := uuid.Parse(invite.TenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: invalid tenant_id on invite", AcceptError))
		return
	}

	if err := h.repo.MarkInviteUsed(c.Request.Context(), invite.ID); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}

	if _, err := h.repo.CreateTenantUser(c.Request.Context(), repository.CreateTenantUserParams{
		ID:       uuid.NewString(),
		TenantID: invite.TenantID,
		UserID:   userUuid.String(),
		Role:     invite.Role,
		IsActive: true,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}

	if err := h.rbac.Assign(c.Request.Context(), userUuid, tenantUuid, invite.Role); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}

	token, err := h.tenants.SetActive(c.Request.Context(), userUuid, tenantUuid)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", AcceptError, err))
		return
	}

	if err := h.auth.SetInTenant(c.Request.Context(), userUuid.String(), true); err != nil {
		logger.Logger.Warn("Failed to set is_in_tenant metadata", "user_id", userUuid, "error", err)
	}

	logger.Logger.Info("Accepted invite", "user_id", userUuid, "tenant_id", tenantUuid, "role", invite.Role)
	handlers.NewSuccessResponse(c, AcceptResponse{
		TenantID: invite.TenantID,
		Token:    token,
		Message:  "Successfully joined organization",
	})
}
