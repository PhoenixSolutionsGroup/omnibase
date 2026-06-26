package tenants

import (
	"context"
	"errors"
	"fmt"

	"api/internal/logger"

	"github.com/google/uuid"
)

var HandleUserCleanupError = errors.New("Failed to clean up user tenant state")

func (s *Service) HandleUserCleanup(ctx context.Context, userID uuid.UUID) error {
	logger.Logger.Debug("Handling user tenant cleanup", "user_id", userID)

	remaining, err := s.repo.ListTenantUsersByUser(ctx, userID.String())
	if err != nil {
		return fmt.Errorf("%w: %w", HandleUserCleanupError, err)
	}

	if len(remaining) == 0 {
		return s.auth.SetInTenant(ctx, userID.String(), false)
	}

	firstTenant, err := uuid.Parse(remaining[0].TenantID)
	if err != nil {
		return fmt.Errorf("%w: %w", HandleUserCleanupError, err)
	}
	if _, err := s.SetActive(ctx, userID, firstTenant); err != nil {
		return fmt.Errorf("%w: %w", HandleUserCleanupError, err)
	}
	return nil
}
