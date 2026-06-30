package invites

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var (
	AcceptError        = errors.New("Failed to accept invite")
	InviteInvalidError = errors.New("Invalid or expired invite token")
	EmailMismatchError = errors.New("This invite was sent to a different email address")
)

type AcceptRequest struct {
	Token string `json:"token" required:"true" example:"tok_test_abc123xyz"`
}

type AcceptResponse struct {
	TenantID string `json:"tenant_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Token    string `json:"token" example:"eyJhbGciOiJIUzI1NiIs..."`
	Message  string `json:"message" example:"Successfully joined organization"`
}

type AcceptInput struct {
	handlers.AuthCtx
	Body AcceptRequest
}

type AcceptOutput struct {
	Body AcceptResponse
}

func (h *Handler) Accept(ctx context.Context, in *AcceptInput) (*AcceptOutput, error) {
	req := in.Body

	invite, err := h.repo.GetActiveInviteByToken(ctx, req.Token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error400BadRequest(InviteInvalidError.Error())
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}

	identities, err := h.auth.GetIdentities(ctx, []string{in.UserID.String()})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}
	caller, ok := identities[in.UserID.String()]
	if !ok || caller.Email == "" {
		return nil, huma.Error400BadRequest("Email not found for caller identity")
	}
	if caller.Email != invite.Email {
		return nil, huma.Error403Forbidden(EmailMismatchError.Error())
	}

	tenantUuid, err := uuid.Parse(invite.TenantID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: invalid tenant_id on invite", AcceptError).Error())
	}

	if err := h.repo.MarkInviteUsed(ctx, invite.ID); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}

	if _, err := h.repo.CreateTenantUser(ctx, repository.CreateTenantUserParams{
		ID:       uuid.NewString(),
		TenantID: invite.TenantID,
		UserID:   in.UserID.String(),
		Role:     invite.Role,
		IsActive: true,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}

	if err := h.rbac.Assign(ctx, in.UserID, tenantUuid, invite.Role); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}

	token, err := h.tenants.SetActive(ctx, in.UserID, tenantUuid)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AcceptError, err).Error())
	}

	if err := h.auth.SetInTenant(ctx, in.UserID.String(), true); err != nil {
		logger.Logger.Warn("Failed to set is_in_tenant metadata", "user_id", in.UserID, "error", err)
	}

	logger.Logger.Info("Accepted invite", "user_id", in.UserID, "tenant_id", tenantUuid, "role", invite.Role)
	return &AcceptOutput{Body: AcceptResponse{
		TenantID: invite.TenantID,
		Token:    token,
		Message:  "Successfully joined organization",
	}}, nil
}
