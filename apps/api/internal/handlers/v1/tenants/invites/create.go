package invites

import (
	"errors"
	"fmt"
	"time"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
	"api/internal/services/permissions"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var CreateError = errors.New("Failed to create invite")

const inviteTemplateType = "tenant-user-invite"
const inviteTTL = 7 * 24 * time.Hour

type CreateRequest struct {
	Email     string `json:"email"      binding:"required,email" example:"test@example.com"`
	Role      string `json:"role"       binding:"required"       example:"member"`
	InviteURL string `json:"invite_url" binding:"required,url"   example:"https://app.example.com/accept-invite"`
}

type CreateResponse struct {
	Invite  repository.AuthTenantInvite `json:"invite"`
	Message string                      `json:"message" example:"Invite sent successfully"`
}

type inviteEmailData struct {
	TenantName string
	Role       string
	InviteURL  string
}

func (h *Handler) Create(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canInvite, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "invite_user", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", CreateError, err))
		return
	}
	if !canInvite {
		handlers.NewForbiddenResponse(c, "Insufficient permissions to invite users")
		return
	}

	tenant, err := h.repo.GetTenantByID(c.Request.Context(), tenantUuid.String())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(c, "Tenant not found")
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", CreateError, err))
		return
	}

	invite, err := h.repo.CreateTenantInvite(c.Request.Context(), repository.CreateTenantInviteParams{
		ID:        uuid.NewString(),
		TenantID:  tenantUuid.String(),
		Email:     req.Email,
		Role:      req.Role,
		Token:     uuid.NewString(),
		InviterID: userUuid.String(),
		ExpiresAt: time.Now().Add(inviteTTL),
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", CreateError, err))
		return
	}

	inviteURL := fmt.Sprintf("%s?token=%s", req.InviteURL, invite.Token)
	if err := h.email.SendWithTemplate(c.Request.Context(), email.SendWithTemplateRequest{
		To:           invite.Email,
		TemplateType: inviteTemplateType,
		Data: inviteEmailData{
			TenantName: tenant.Name,
			Role:       invite.Role,
			InviteURL:  inviteURL,
		},
	}); err != nil {
		logger.Logger.Warn("Failed to send invite email", "to", invite.Email, "error", err)
	}

	logger.Logger.Debug("Created tenant invite", "tenant_id", tenantUuid, "email", invite.Email, "role", invite.Role)
	handlers.NewSuccessResponse(c, CreateResponse{Invite: invite, Message: "Invite sent successfully"})
}
