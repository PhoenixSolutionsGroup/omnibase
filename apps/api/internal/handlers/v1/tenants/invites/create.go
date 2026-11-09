package invites

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/authz"
	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
)

var (
	CreateError           = errors.New("Failed to create invite")
	InvalidRoleError      = errors.New("Role does not exist for this tenant")
	InvalidInviteURLError = errors.New("Invite URL is not allowed")
)

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

	tenant, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Tenant not found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateError, err).Error())
	}

	if _, err := h.repo.GetRoleByNameAndTenant(ctx, repository.GetRoleByNameAndTenantParams{
		RoleName: req.Role,
		TenantID: in.TenantID,
	}); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error400BadRequest(InvalidRoleError.Error())
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateError, err).Error())
	}

	if req.Role == "owner" {
		if err := authz.Check(ctx, h.perms, in.Method, in.UserID, in.TenantID, "Tenant", in.TenantID.String(), "update_user_role_to_owner"); err != nil {
			return nil, err
		}
	}

	if err := validateInviteURL(req.InviteURL, h.allowedInviteOrigins); err != nil {
		return nil, huma.Error400BadRequest(err.Error())
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
		TenantID:     in.TenantID,
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

func validateInviteURL(rawURL string, allowedOrigins []string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return InvalidInviteURLError
	}

	origin := parsed.Scheme + "://" + parsed.Host
	for _, allowed := range allowedOrigins {
		allowed = strings.TrimRight(strings.TrimSpace(allowed), "/")
		if allowed == "" || allowed == "*" {
			continue
		}
		if strings.EqualFold(allowed, origin) {
			return nil
		}
	}
	return InvalidInviteURLError
}
