package rbac

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/logger"
)

var CloneTemplatesIntoTenantError = errors.New("Failed to clone role templates into tenant")

func (s *Service) CloneTemplatesIntoTenant(ctx context.Context, tenantID uuid.UUID) error {
	templates, err := s.repo.ListRoleTemplates(ctx)
	if err != nil {
		return fmt.Errorf("%w: %w", CloneTemplatesIntoTenantError, err)
	}
	for _, tmpl := range templates {
		templateID := tmpl.ID
		_, err := s.repo.CreateRole(ctx, repository.CreateRoleParams{
			TenantID:    tenantID,
			RoleName:    tmpl.RoleName,
			Permissions: tmpl.Permissions,
			TemplateID:  &templateID,
			UserIds:     []uuid.UUID{},
		})
		if err != nil {
			return fmt.Errorf("%w: %s: %w", CloneTemplatesIntoTenantError, tmpl.RoleName, err)
		}
	}
	logger.Logger.Info("cloned role templates into tenant", "tenant_id", tenantID, "count", len(templates))
	return nil
}
