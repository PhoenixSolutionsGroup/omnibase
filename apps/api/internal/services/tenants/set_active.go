package tenants

import (
	"context"
	"errors"
	"fmt"

	"api/internal/database/repository"
	"api/internal/logger"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var (
	SetActiveError    = errors.New("Failed to set active tenant")
	NotTenantMemberError = errors.New("User is not a member of this tenant")
)

func (s *Service) SetActive(ctx context.Context, userID, tenantID uuid.UUID) (string, error) {
	logger.Logger.Debug("Setting active tenant", "user_id", userID, "tenant_id", tenantID)

	if _, err := s.repo.GetTenantUser(ctx, repository.GetTenantUserParams{
		TenantID: tenantID.String(),
		UserID:   userID.String(),
	}); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", NotTenantMemberError
		}
		return "", fmt.Errorf("%w: %w", SetActiveError, err)
	}

	if err := s.repo.DeactivateAllUserTenants(ctx, userID.String()); err != nil {
		return "", fmt.Errorf("%w: %w", SetActiveError, err)
	}
	if err := s.repo.ActivateUserTenant(ctx, repository.ActivateUserTenantParams{
		UserID:   userID.String(),
		TenantID: tenantID.String(),
	}); err != nil {
		return "", fmt.Errorf("%w: %w", SetActiveError, err)
	}

	token, err := s.CreateJWT(ctx, userID, tenantID)
	if err != nil {
		return "", err
	}
	return token, nil
}
