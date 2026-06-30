package rbac

import (
	"context"
	"errors"
	"fmt"

	"api/internal/database/repository"
	"api/internal/logger"
	"api/internal/services/permissions"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var RevokeUserError = errors.New("Failed to revoke role from user")

func (s *Service) RevokeUser(ctx context.Context, userID, tenantID uuid.UUID, roleName string) error {
	logger.Logger.Debug("Revoking role from user", "user_id", userID, "tenant_id", tenantID, "role_name", roleName)

	role, err := s.repo.GetRoleByNameAndTenant(ctx, repository.GetRoleByNameAndTenantParams{
		RoleName: roleName,
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return RoleNotFoundError
		}
		return fmt.Errorf("%w: %w", RevokeUserError, err)
	}

	if err := s.repo.RemoveUserFromRole(ctx, repository.RemoveUserFromRoleParams{
		RoleID:   role.ID,
		TenantID: tenantID,
		UserID:   userID,
	}); err != nil {
		return fmt.Errorf("%w: %w", RevokeUserError, err)
	}

	subject := &permissions.SubjectSet{Namespace: "User", Object: userID.String()}
	tuples, err := s.perms.List(ctx, "Tenant", tenantID.String(), "", subject)
	if err != nil {
		return fmt.Errorf("%w: %w", RevokeUserError, err)
	}

	for _, t := range tuples {
		if t.SubjectSet == nil {
			continue
		}
		if err := s.perms.Delete(ctx, t.Namespace, t.Object, t.Relation, *t.SubjectSet); err != nil {
			logger.Logger.Warn("Failed to delete relation tuple", "namespace", t.Namespace, "object", t.Object, "relation", t.Relation, "error", err)
		}
	}

	logger.Logger.Info("Revoked role from user", "user_id", userID, "tenant_id", tenantID, "role_name", roleName, "tuples_removed", len(tuples))
	return nil
}
