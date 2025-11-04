package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	"context"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type RolesHandler struct {
	db   *gorm.DB
	keto *services_v1.KetoService
}

func NewRolesHandler(cfg *config.Config) *RolesHandler {
	logger.Logger.Info("Initializing roles handler")

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		panic(err)
	}

	logger.Logger.Debug("Creating Keto service client",
		"read_url", cfg.PermissionsConfig.ReadURL,
		"write_url", cfg.PermissionsConfig.WriteURL)

	return &RolesHandler{
		db:   db,
		keto: services_v1.NewKetoService(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL),
	}
}

// GetDefinitions returns available namespaces and their relations
func (h *RolesHandler) GetDefinitions(c *gin.Context) {
	logger.Logger.Info("Fetching namespace definitions")

	var definitions []models.NamespaceDefinition
	if err := h.db.Find(&definitions).Error; err != nil {
		logger.Logger.Error("Failed to fetch namespace definitions", "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully fetched namespace definitions", "count", len(definitions))
	handlers.NewSuccessResponse(c, gin.H{"definitions": definitions})
}

// ListRoles returns all roles for the tenant
func (h *RolesHandler) ListRoles(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		logger.Logger.Warn("Missing tenant_id in request context")
		handlers.NewBadRequestResponse(c, "Missing tenant_id")
		return
	}

	logger.Logger.Info("Listing roles for tenant", "tenant_id", tenantID)

	var roles []models.Role
	if err := h.db.Where("tenant_id = ? OR tenant_id IS NULL", tenantID).Find(&roles).Error; err != nil {
		logger.Logger.Error("Failed to list roles", "tenant_id", tenantID, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully listed roles", "tenant_id", tenantID, "count", len(roles))
	handlers.NewSuccessResponse(c, gin.H{"roles": roles})
}

// CreateRole creates a new custom role
func (h *RolesHandler) CreateRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		logger.Logger.Warn("Missing tenant_id in request context")
		handlers.NewBadRequestResponse(c, "Missing tenant_id")
		return
	}

	var req struct {
		RoleName    string   `json:"role_name" binding:"required"`
		Permissions []string `json:"permissions" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body for create role", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Info("Creating new role",
		"tenant_id", tenantID,
		"role_name", req.RoleName,
		"permissions_count", len(req.Permissions))
	logger.Logger.Debug("Role permissions", "permissions", req.Permissions)

	role := models.Role{
		TenantID:    &tenantID,
		RoleName:    req.RoleName,
		Permissions: pq.StringArray(req.Permissions),
		UserIDs:     pq.StringArray{},
	}

	if err := h.db.Create(&role).Error; err != nil {
		logger.Logger.Error("Failed to create role",
			"tenant_id", tenantID,
			"role_name", req.RoleName,
			"error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully created role",
		"tenant_id", tenantID,
		"role_id", role.ID,
		"role_name", role.RoleName)
	handlers.NewSuccessResponse(c, role)
}

// UpdateRole updates an existing role
func (h *RolesHandler) UpdateRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	roleID := c.Param("role_id")

	logger.Logger.Info("Updating role", "tenant_id", tenantID, "role_id", roleID)

	var req struct {
		Permissions []string `json:"permissions" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body for update role", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("New permissions for role",
		"role_id", roleID,
		"permissions", req.Permissions)

	var role models.Role
	if err := h.db.Where("id = ? AND tenant_id = ?", roleID, tenantID).First(&role).Error; err != nil {
		logger.Logger.Warn("Role not found", "role_id", roleID, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(c, "Role not found")
		return
	}

	logger.Logger.Info("Deleting old Keto relationships",
		"role_id", roleID,
		"user_count", len(role.UserIDs),
		"old_permissions_count", len(role.Permissions))

	// Delete old Keto relationships for all users
	for _, userID := range role.UserIDs {
		for _, permission := range role.Permissions {
			logger.Logger.Debug("Deleting Keto relationship",
				"user_id", userID,
				"permission", permission)
			_ = h.deleteKetoRelationship(c.Request.Context(), permission, userID, tenantID)
		}
	}

	// Update role permissions
	oldPermissions := role.Permissions
	role.Permissions = pq.StringArray(req.Permissions)

	if err := h.db.Save(&role).Error; err != nil {
		logger.Logger.Error("Failed to update role in database",
			"role_id", roleID,
			"error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Creating new Keto relationships",
		"role_id", roleID,
		"user_count", len(role.UserIDs),
		"new_permissions_count", len(role.Permissions))

	// Create new Keto relationships for all users
	for _, userID := range role.UserIDs {
		for _, permission := range role.Permissions {
			logger.Logger.Debug("Creating Keto relationship",
				"user_id", userID,
				"permission", permission)
			if err := h.createKetoRelationship(c.Request.Context(), permission, userID, tenantID); err != nil {
				logger.Logger.Error("Failed to create Keto relationship",
					"user_id", userID,
					"permission", permission,
					"error", err)
				handlers.NewInternalServerErrorResponse(c, err)
				return
			}
		}
	}

	logger.Logger.Info("Successfully updated role",
		"role_id", roleID,
		"old_permissions", oldPermissions,
		"new_permissions", role.Permissions)
	handlers.NewSuccessResponse(c, role)
}

// DeleteRole deletes a role
func (h *RolesHandler) DeleteRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	roleID := c.Param("role_id")

	logger.Logger.Info("Deleting role", "tenant_id", tenantID, "role_id", roleID)

	var role models.Role
	if err := h.db.Where("id = ? AND tenant_id = ?", roleID, tenantID).First(&role).Error; err != nil {
		logger.Logger.Warn("Role not found for deletion", "role_id", roleID, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(c, "Role not found")
		return
	}

	logger.Logger.Info("Deleting Keto relationships for role",
		"role_id", roleID,
		"role_name", role.RoleName,
		"user_count", len(role.UserIDs),
		"permissions_count", len(role.Permissions))

	// Delete all Keto relationships for assigned users
	for _, userID := range role.UserIDs {
		for _, permission := range role.Permissions {
			logger.Logger.Debug("Deleting Keto relationship",
				"user_id", userID,
				"permission", permission)
			_ = h.deleteKetoRelationship(c.Request.Context(), permission, userID, tenantID)
		}
	}

	if err := h.db.Delete(&role).Error; err != nil {
		logger.Logger.Error("Failed to delete role from database",
			"role_id", roleID,
			"error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully deleted role",
		"role_id", roleID,
		"role_name", role.RoleName)
	handlers.NewSuccessResponse(c, gin.H{"message": "Role deleted successfully"})
}

// AssignRole assigns a role to a user
func (h *RolesHandler) AssignRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.Param("user_id")

	logger.Logger.Info("Assigning role to user", "tenant_id", tenantID, "user_id", userID)

	var req struct {
		RoleID   *string `json:"role_id"`
		RoleName *string `json:"role_name"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body for assign role", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	// Validate that exactly one is provided
	if (req.RoleID == nil && req.RoleName == nil) || (req.RoleID != nil && req.RoleName != nil) {
		logger.Logger.Warn("Must provide exactly one of role_id or role_name")
		handlers.NewBadRequestResponse(c, "Must provide exactly one of role_id or role_name")
		return
	}

	logger.Logger.Debug("Looking up role", "role_id", req.RoleID, "role_name", req.RoleName)

	// Get role by either ID or name
	var role models.Role
	var err error
	if req.RoleID != nil {
		err = h.db.Where("id = ? AND (tenant_id = ? OR tenant_id IS NULL)", *req.RoleID, tenantID).First(&role).Error
	} else {
		err = h.db.Where("role_name = ? AND (tenant_id = ? OR tenant_id IS NULL)", *req.RoleName, tenantID).First(&role).Error
	}

	if err != nil {
		logger.Logger.Warn("Role not found for assignment", "role_id", req.RoleID, "role_name", req.RoleName, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(c, "Role not found")
		return
	}

	// Call the extracted helper
	if err := h.assignRoleToUser(c.Request.Context(), userID, &role, tenantID); err != nil {
		logger.Logger.Error("Failed to assign role to user", "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully assigned role to user",
		"role_id", role.ID,
		"role_name", role.RoleName,
		"user_id", userID,
		"total_users", len(role.UserIDs))
	handlers.NewSuccessResponse(c, gin.H{"message": "Role assigned successfully"})
}

// createKetoRelationship parses permission format and creates Keto relationship
func (h *RolesHandler) createKetoRelationship(ctx context.Context, permission, userID, tenantID string) error {
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

	return h.keto.CreateRelationTuple(ctx, namespace, resourceID, relation, userID)
}

// deleteKetoRelationship parses permission format and deletes Keto relationship
func (h *RolesHandler) deleteKetoRelationship(ctx context.Context, permission, userID, tenantID string) error {
	logger.Logger.Debug("Parsing permission for Keto relationship deletion",
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
		namespace = strings.Title(resourceParts[0])
		resourceID = tenantID
	} else {
		namespace = strings.Title(resourceParts[0])
		resourceID = resourceParts[1]
	}

	logger.Logger.Info("Deleting Keto relation tuple",
		"namespace", namespace,
		"resource_id", resourceID,
		"relation", relation,
		"user_id", userID)

	return h.keto.DeleteRelationTuple(ctx, namespace, resourceID, relation, userID)
}

// assignRoleToUser is an internal helper that assigns a role to a user
// This is extracted for reuse in both HTTP and internal contexts
func (h *RolesHandler) assignRoleToUser(ctx context.Context, userID string, role *models.Role, tenantID string) error {
	logger.Logger.Info("Creating Keto relationships for role assignment",
		"role_id", role.ID,
		"role_name", role.RoleName,
		"user_id", userID,
		"permissions_count", len(role.Permissions))

	// Create Keto relationships for all permissions
	for _, permission := range role.Permissions {
		logger.Logger.Debug("Creating Keto relationship for permission",
			"user_id", userID,
			"permission", permission)
		if err := h.createKetoRelationship(ctx, permission, userID, tenantID); err != nil {
			logger.Logger.Error("Failed to create Keto relationship",
				"user_id", userID,
				"permission", permission,
				"error", err)
			return fmt.Errorf("failed to create permission: %w", err)
		}
	}

	// Add user to role's user_ids array
	role.UserIDs = append(role.UserIDs, userID)
	if err := h.db.Save(&role).Error; err != nil {
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

// AssignRoleByName assigns a role to a user by role name (for internal use)
// This is a convenience wrapper around assignRoleToUser that looks up the role by name
func (h *RolesHandler) AssignRoleByName(ctx context.Context, userID, roleName, tenantID string) error {
	logger.Logger.Info("Assigning role by name to user",
		"user_id", userID,
		"role_name", roleName,
		"tenant_id", tenantID)

	// Get role by name (supports both system and custom roles)
	var role models.Role
	if err := h.db.Where("role_name = ? AND (tenant_id = ? OR tenant_id IS NULL)", roleName, tenantID).First(&role).Error; err != nil {
		logger.Logger.Warn("Role not found for assignment",
			"role_name", roleName,
			"tenant_id", tenantID,
			"error", err)
		return fmt.Errorf("role not found: %w", err)
	}

	return h.assignRoleToUser(ctx, userID, &role, tenantID)
}
