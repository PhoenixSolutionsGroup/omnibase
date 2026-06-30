package invites

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
	"api/internal/services/permissions"
)

var CreateError = errors.New("Failed to create invite")

const inviteTemplateType = "tenant-user-invite"
const inviteTTL = 7 * 24 * time.Hour

type CreateRequest struct {
	Email     string `json:"email" required:"true" format:"email" example:"test@example.com"`
	Role      string `json:"role" required:"true" example:"member"`
	InviteURL string `json:"invite_url" required:"true" format:"uri" example:"https://app.example.com/accept-invite"`
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

type CreateInput struct {
	handlers.AuthCtx
	Body CreateRequest
}

type CreateOutput struct {
	Body CreateResponse
}

func (h *Handler) Create(ctx context.Context, in *CreateInput) (*CreateOutput, error) {
	req := in.Body

	subject := permissions.SubjectSet{Namespace: "User", Object: in.UserID.String()}
	canInvite, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "invite_user", subject)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateError, err).Error())
	}
	if !canInvite {
		return nil, huma.Error403Forbidden("Insufficient permissions to invite users")
	}

	tenant, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Tenant not found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateError, err).Error())
	}

	invite, err := h.repo.CreateTenantInvite(ctx, repository.CreateTenantInviteParams{
		ID:        uuid.NewString(),
		TenantID:  in.TenantID.String(),
		Email:     req.Email,
		Role:      req.Role,
		Token:     uuid.NewString(),
		InviterID: in.UserID.String(),
		ExpiresAt: time.Now().Add(inviteTTL),
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateError, err).Error())
	}

	inviteURL := fmt.Sprintf("%s?token=%s", req.InviteURL, invite.Token)
	if err := h.email.SendWithTemplate(ctx, email.SendWithTemplateRequest{
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

	logger.Logger.Debug("Created tenant invite", "tenant_id", in.TenantID, "email", invite.Email, "role", invite.Role)
	return &CreateOutput{Body: CreateResponse{Invite: invite, Message: "Invite sent successfully"}}, nil
}
