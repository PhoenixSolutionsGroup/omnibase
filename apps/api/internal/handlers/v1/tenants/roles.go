package tenants

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
		logger.Logger.Error("Failed to get database connection in roles handler", "error", err)
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

// NamespaceDefinitionsResponse represents the namespace definitions response
type NamespaceDefinitionsResponse struct {
	// List of namespace definitions
	Definitions []models.NamespaceDefinition `json:"definitions" binding:"required"`
}

// GetDefinitions returns available namespaces and their relations
// @Summary      Get namespace definitions
// @Description  Returns all available permission namespaces and their relations from the database.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with appropriate permissions.
// @Description
// @Description  ## Use Cases
// @Description  - Discover available permission namespaces
// @Description  - List relations for each namespace
// @Description  - Build dynamic permission UIs
// @ID           getRoleDefinitions
// @Tags         V1 Tenants
// @Produce      json
// @Success      200 {object} handlers.SuccessResponse{data=NamespaceDefinitionsResponse} "Namespace definitions retrieved successfully"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to fetch definitions"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/roles/definitions [get]
func (h *RolesHandler) GetDefinitions(c *gin.Context) {
	logger.Logger.Info("Fetching namespace definitions")

	var definitions []models.NamespaceDefinition
	if err := h.db.Find(&definitions).Error; err != nil {
		logger.Logger.Error("Failed to fetch namespace definitions", "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Successfully fetched namespace definitions", "count", len(definitions))
	handlers.NewSuccessResponse(c, NamespaceDefinitionsResponse{Definitions: definitions})
}

// RolesListResponse represents the roles list response
type RolesListResponse struct {
	// List of roles (including system roles)
	Roles []models.Role `json:"roles" binding:"required"`
}

// ListRoles returns all roles for the tenant
// @Summary      List roles
// @Description  Returns all roles for the authenticated tenant, including both system roles and custom tenant-specific roles.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context.
// @Description
// @Description  ## Use Cases
// @Description  - Display available roles to assign
// @Description  - Role management UI
// @Description  - Permission auditing
// @ID           listRoles
// @Tags         V1 Tenants
// @Produce      json
// @Success      200 {object} handlers.SuccessResponse{data=RolesListResponse} "Roles retrieved successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Missing tenant ID"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to list roles"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/roles [get]
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
	handlers.NewSuccessResponse(c, RolesListResponse{Roles: roles})
}

// CreateRoleRequest represents the request to create a new role
type CreateRoleRequest struct {
	// Name of the role (required, cannot be empty)
	RoleName string `json:"role_name" binding:"required,min=1" example:"test_project_viewer"`
	// List of permissions in namespace:resource#relation format (required, must have at least one non-empty permission). Empty strings are not allowed and will be rejected with a 400 error.
	Permissions []string `json:"permissions" binding:"required,min=1" validate:"required,min=1,dive,min=1" example:"project:*#view,tenant#read"`
}

// CreateRole creates a new custom role
// @Summary      Create role
// @Description  Creates a new custom role for the tenant with specified permissions.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context and appropriate permissions.
// @Description
// @Description  ## Permission Format
// @Description  Permissions should be in the format: `namespace:resource#relation`
// @Description  - Tenant-wide: `tenant#relation`
// @Description  - Resource-specific: `project:uuid#relation`
// @Description
// @Description  ## Use Cases
// @Description  - Create custom roles for specific workflows
// @Description  - Define project-specific permissions
// @Description  - Build granular access control
// @ID           createRole
// @Tags         V1 Tenants
// @Accept       json
// @Produce      json
// @Param        request body CreateRoleRequest true "Role creation parameters"
// @Success      200 {object} handlers.SuccessResponse{data=models.Role} "Role created successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request or missing tenant ID"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create role"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/roles [post]
func (h *RolesHandler) CreateRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		logger.Logger.Warn("Missing tenant_id in request context")
		handlers.NewBadRequestResponse(c, "Missing tenant_id")
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		logger.Logger.Warn("Missing user_id in request context")
		handlers.NewBadRequestResponse(c, "Missing user_id")
		return
	}

	logger.Logger.Debug("Verifying user has create_roles permission", "user_id", userID)
	canCreateRoles, err := h.keto.CheckPermission(c.Request.Context(), "Tenant", tenantID, "create_roles", userID)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", userID)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canCreateRoles {
		logger.Logger.Warn("User lacks permission to create roles", "tenant_id", tenantID, "user_id", userID)
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `create_roles` permission")
		return
	}

	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body for create role", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	// Validate that permissions array doesn't contain empty strings
	for _, perm := range req.Permissions {
		if perm == "" {
			logger.Logger.Warn("Empty permission in permissions array")
			handlers.NewBadRequestResponse(c, "Permissions array cannot contain empty values")
			return
		}
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
		// Check if it's a duplicate key constraint violation
		if strings.Contains(err.Error(), "duplicate key") ||
			strings.Contains(err.Error(), "roles_tenant_id_role_name_key") {
			logger.Logger.Warn("Role already exists",
				"tenant_id", tenantID,
				"role_name", req.RoleName)
			handlers.NewConflictResponse(c, "Role with this name already exists for tenant")
			return
		}

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

// UpdateRoleRequest represents the request to update a role
type UpdateRoleRequest struct {
	// Updated list of permissions
	Permissions []string `json:"permissions" binding:"required" example:"project:*#view,project:*#edit"`
}

func (h *RolesHandler) UpdateRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	logger.Logger.Debug("Verifying user has update_roles permission", "user_id", userID)
	canUpdateRoles, err := h.keto.CheckPermission(c.Request.Context(), "Tenant", tenantID, "update_roles", userID)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", userID)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canUpdateRoles {
		logger.Logger.Warn("User lacks permission to update roles", "tenant_id", tenantID, "user_id", userID)
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `update_roles` permission")
		return
	}

	roleID := c.Param("role_id")

	logger.Logger.Info("Updating role", "tenant_id", tenantID, "role_id", roleID)

	var req UpdateRoleRequest

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

// DeleteRoleResponse represents the role deletion response
type DeleteRoleResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Role deleted successfully"`
}

func (h *RolesHandler) DeleteRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	logger.Logger.Debug("Verifying user has delete_roles permission", "user_id", userID)
	canDeleteRoles, err := h.keto.CheckPermission(c.Request.Context(), "Tenant", tenantID, "delete_roles", userID)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", userID)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canDeleteRoles {
		logger.Logger.Warn("User lacks permission to delete roles", "tenant_id", tenantID, "user_id", userID)
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `delete_roles` permission")
		return
	}

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
	handlers.NewSuccessResponse(c, DeleteRoleResponse{Message: "Role deleted successfully"})
}

// AssignRoleRequest represents the request to assign a role to a user
// swagger:model
type AssignRoleRequest struct {
	// Role ID to assign (provide either role_id or role_name, not both)
	RoleID *string `json:"role_id,omitempty" binding:"omitempty,min=1" example:"role_test_123" extensions:"x-omitempty"`
	// Role name to assign (provide either role_id or role_name, not both)
	RoleName *string `json:"role_name,omitempty" binding:"omitempty,min=1" example:"member" extensions:"x-omitempty"`
}

// AssignRoleResponse represents the role assignment response
type AssignRoleResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Role assigned successfully"`
}

func (h *RolesHandler) AssignRole(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.Param("user_id")

	logger.Logger.Info("Assigning role to user", "tenant_id", tenantID, "user_id", userID)

	var req AssignRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body for assign role", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	// Validate that exactly one is provided and not empty
	bothNil := req.RoleID == nil && req.RoleName == nil
	bothProvided := req.RoleID != nil && req.RoleName != nil
	roleIDEmpty := req.RoleID != nil && *req.RoleID == ""
	roleNameEmpty := req.RoleName != nil && *req.RoleName == ""

	if bothNil || bothProvided || roleIDEmpty || roleNameEmpty {
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
	handlers.NewSuccessResponse(c, AssignRoleResponse{Message: "Role assigned successfully"})
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
