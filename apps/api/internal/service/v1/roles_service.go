package services_v1

import (
	"api/internal/logger"
	"api/internal/models"
	"context"
	"fmt"
	"strings"

	"gorm.io/gorm"
)

type RolesService struct {
	db   *gorm.DB
	keto *KetoService
}

func NewRolesService(db *gorm.DB, keto *KetoService) *RolesService {
	logger.Logger.Info("Initializing roles service")
	return &RolesService{
		db:   db,
		keto: keto,
	}
}

// AssignRoleByName assigns a role to a user by role name
func (s *RolesService) AssignRoleByName(ctx context.Context, userID, roleName, tenantID string) error {
	logger.Logger.Info("Assigning role by name to user",
		"user_id", userID,
		"role_name", roleName,
		"tenant_id", tenantID)

	var role models.Role
	err := s.db.Preload("Template").
		Where("role_name = ? AND tenant_id = ?", roleName, tenantID).
		First(&role).Error

	if err != nil {
		logger.Logger.Warn("Role not found for tenant",
			"role_name", roleName,
			"tenant_id", tenantID,
			"error", err)
		return fmt.Errorf("role not found: %w", err)
	}

	return s.assignRoleToUser(ctx, userID, &role, tenantID)
}

// assignRoleToUser is an internal helper that assigns a role to a user
// Creates all Keto relationships for the role's permissions
func (s *RolesService) assignRoleToUser(ctx context.Context, userID string, role *models.Role, tenantID string) error {
	// Get effective permissions (from template or custom)
	permissions := role.GetEffectivePermissions()

	logger.Logger.Info("Creating Keto relationships for role assignment",
		"role_id", role.ID,
		"role_name", role.RoleName,
		"user_id", userID,
		"is_template_based", role.TemplateID != nil,
		"permissions_count", len(permissions))

	// Create Keto relationships for all permissions
	for _, permission := range permissions {
		logger.Logger.Debug("Creating Keto relationship for permission",
			"user_id", userID,
			"permission", permission)
		if err := s.createKetoRelationship(ctx, permission, userID, tenantID); err != nil {
			logger.Logger.Error("Failed to create Keto relationship",
				"user_id", userID,
				"permission", permission,
				"error", err)
			return fmt.Errorf("failed to create permission: %w", err)
		}
	}

	// Add user to role's user_ids array
	role.UserIDs = append(role.UserIDs, userID)
	if err := s.db.Save(&role).Error; err != nil {
		logger.Logger.Error("Failed to save role after user assignment",
			"role_id", role.ID,
			"user_id", userID,
			"error", err)
		return fmt.Errorf("failed to update role: %w", err)
	}

	logger.Logger.Info("Successfully assigned role to user",
		"role_id", role.ID,
		"role_name", role.RoleName,
		"user_id", userID,
		"total_users", len(role.UserIDs))

	return nil
}

// createKetoRelationship parses permission format and creates Keto relationship
func (s *RolesService) createKetoRelationship(ctx context.Context, permission, userID, tenantID string) error {
	logger.Logger.Debug("Parsing permission for Keto relationship",
		"permission", permission,
		"user_id", userID,
		"tenant_id", tenantID)

	parts := strings.Split(permission, "#")
	if len(parts) != 2 {
		logger.Logger.Error("Invalid permission format", "permission", permission)
		return fmt.Errorf("invalid permission format: %s", permission)
	}

	relation := parts[1]
	resourceParts := strings.Split(parts[0], ":")

	var namespace, resourceID string
	if len(resourceParts) == 1 {
		// tenant#relation -> Tenant:{tenant_id}#relation
		namespace = strings.Title(resourceParts[0])
		resourceID = tenantID
		logger.Logger.Debug("Tenant-wide permission",
			"namespace", namespace,
			"relation", relation,
			"resource_id", resourceID)
	} else {
		// project:uuid#relation
		namespace = strings.Title(resourceParts[0])
		resourceID = resourceParts[1]
		logger.Logger.Debug("Resource-specific permission",
			"namespace", namespace,
			"relation", relation,
			"resource_id", resourceID)
	}

	logger.Logger.Info("Creating Keto relation tuple",
		"namespace", namespace,
		"resource_id", resourceID,
		"relation", relation,
		"user_id", userID)

	return s.keto.CreateRelationTuple(ctx, namespace, resourceID, relation, userID)
}
