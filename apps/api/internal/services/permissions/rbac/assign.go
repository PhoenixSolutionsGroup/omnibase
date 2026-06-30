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

var (
	AssignError       = errors.New("Failed to assign role")
	RoleNotFoundError = errors.New("Role not found for tenant")
)

func (s *Service) Assign(ctx context.Context, userID, tenantID uuid.UUID, roleName string) error {
	logger.Logger.Debug("Assigning role to user", "user_id", userID, "tenant_id", tenantID, "role_name", roleName)

	role, err := s.repo.GetRoleByNameAndTenant(ctx, repository.GetRoleByNameAndTenantParams{
		RoleName: roleName,
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return RoleNotFoundError
		}
		return fmt.Errorf("%w: %w", AssignError, err)
	}

	effective := role.Permissions
	if role.TemplateID != nil && len(role.TemplatePermissions) > 0 {
		effective = role.TemplatePermissions
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userID.String()}
	for _, perm := range effective {
		ns, obj, rel, perr := permissions.ParsePermission(perm, tenantID.String())
		if perr != nil {
			return fmt.Errorf("%w: %w", AssignError, perr)
		}
		if err := s.perms.Create(ctx, ns, obj, rel, subject); err != nil {
			return fmt.Errorf("%w: %w", AssignError, err)
		}
	}

	if err := s.repo.AddUserToRole(ctx, repository.AddUserToRoleParams{
		RoleID:   role.ID,
		TenantID: tenantID,
		UserID:   userID,
	}); err != nil {
		return fmt.Errorf("%w: %w", AssignError, err)
	}

	logger.Logger.Info("Assigned role", "user_id", userID, "tenant_id", tenantID, "role_name", roleName, "permissions_count", len(effective))
	return nil
}
