package v1

import (
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	keto "github.com/ory/keto-client-go"
)

type PermissionsHandler struct {
	readURL      string
	writeURL     string
	ketoReadAPI  keto.PermissionApi
	ketoWriteAPI keto.RelationshipApi
}

func NewPermissionsHandler(cfg *config.Config) *PermissionsHandler {
	logger.Logger.Info("Initializing PermissionsHandler", "read_url", cfg.PermissionsConfig.ReadURL, "write_url", cfg.PermissionsConfig.WriteURL)

	// Configure Keto read client
	readConfig := keto.NewConfiguration()
	readConfig.Servers = keto.ServerConfigurations{
		keto.ServerConfiguration{
			URL: cfg.PermissionsConfig.ReadURL,
		},
	}

	// Configure Keto write client
	writeConfig := keto.NewConfiguration()
	writeConfig.Servers = keto.ServerConfigurations{
		keto.ServerConfiguration{
			URL: cfg.PermissionsConfig.WriteURL,
		},
	}

	return &PermissionsHandler{
		readURL:      cfg.PermissionsConfig.ReadURL,
		writeURL:     cfg.PermissionsConfig.WriteURL,
		ketoReadAPI:  keto.NewAPIClient(readConfig).PermissionApi,
		ketoWriteAPI: keto.NewAPIClient(writeConfig).RelationshipApi,
	}
}

// CheckPermissionRequest represents the request body for checking permissions
// Exactly one of subject_id or subject_set must be provided (mutually exclusive)
type CheckPermissionRequest struct {
	// Namespace of the relationship (required, cannot be empty)
	Namespace string `json:"namespace" binding:"required,min=1" example:"Tenant"`
	// Object ID to check permission on (required, cannot be empty)
	Object string `json:"object" binding:"required,min=1" example:"tenant_test_123"`
	// Relation to check (required, cannot be empty)
	Relation string `json:"relation" binding:"required,min=1" example:"can_invite_user"`
	// Subject ID (user ID) to check permission for - provide either this OR subject_set, not both
	SubjectID *string `json:"subject_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Subject set (alternative to subject_id) - provide either this OR subject_id, not both
	SubjectSet *SubjectSetRequest `json:"subject_set,omitempty"`
}

// SubjectSetRequest represents a subject set in permission checks
type SubjectSetRequest struct {
	// Namespace of the subject set
	Namespace string `json:"namespace" binding:"required" example:"Tenant"`
	// Object of the subject set
	Object string `json:"object" binding:"required" example:"tenant_test_123"`
	// Relation of the subject set
	Relation string `json:"relation,omitempty" example:"can_invite_user"`
}

// CheckPermissionResponse represents the response for permission checks
type CheckPermissionResponse struct {
	// Whether the permission check passed
	Allowed bool `json:"allowed" binding:"required" example:"true"`
}

// CheckPermission godoc
// @Summary      Check permission
// @Description  Checks if a subject has a specific permission on an object using Ory Keto.
// @Description
// @Description  ## Authentication
// @Description  Requires session authentication.
// @Description
// @Description  ## Request Format
// @Description  Provide either `subject_id` or `subject_set` (not both).
// @Description
// @Description  ## Use Cases
// @Description  - Verify user permissions before performing actions
// @Description  - Implement fine-grained access control
// @Description  - Check role-based permissions
// @Tags         V1 Permissions
// @Accept       json
// @Produce      json
// @Param        body body CheckPermissionRequest true "Permission check request"
// @Success      200 {object} handlers.SuccessResponse{data=CheckPermissionResponse} "Permission check result"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body - namespace, object, and relation cannot be empty"
// @Failure      401 {object} handlers.UnauthorizedResponse "Not authenticated"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to check permission"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/permissions/check [post]
// @ID           checkPermission
func (h *PermissionsHandler) CheckPermission(ctx *gin.Context) {
	logger.Logger.Debug("CheckPermission handler started")

	var req CheckPermissionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body", "error", err)
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	// Validate that exactly one of subject_id or subject_set is provided
	if req.SubjectID != nil && req.SubjectSet != nil {
		logger.Logger.Warn("Both subject_id and subject_set provided in permission check")
		handlers.NewBadRequestResponse(ctx, "Provide either subject_id or subject_set, not both")
		return
	}
	if req.SubjectID == nil && req.SubjectSet == nil {
		logger.Logger.Warn("Neither subject_id nor subject_set provided in permission check")
		handlers.NewBadRequestResponse(ctx, "Either subject_id or subject_set must be provided")
		return
	}

	logger.Logger.Debug("Checking permission via Keto SDK",
		"namespace", req.Namespace,
		"object", req.Object,
		"relation", req.Relation,
		"has_subject_id", req.SubjectID != nil,
		"has_subject_set", req.SubjectSet != nil)

	// Build the check request
	checkReq := h.ketoReadAPI.CheckPermission(ctx.Request.Context()).
		Namespace(req.Namespace).
		Object(req.Object).
		Relation(req.Relation)

	if req.SubjectID != nil {
		checkReq = checkReq.SubjectId(*req.SubjectID)
	}

	if req.SubjectSet != nil {
		checkReq = checkReq.SubjectSetNamespace(req.SubjectSet.Namespace).
			SubjectSetObject(req.SubjectSet.Object).
			SubjectSetRelation(req.SubjectSet.Relation)
	}

	// Execute the permission check
	result, resp, err := checkReq.Execute()
	if err != nil {
		statusCode := 500
		if resp != nil {
			statusCode = resp.StatusCode
		}

		logger.Logger.Error("Failed to check permission",
			"error", err,
			"http_status", statusCode)

		// Return the same status code that Keto returned (400 for bad requests, etc.)
		if statusCode >= 400 && statusCode < 500 {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Permission check failed: %s", err))
		} else {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("failed to check permission: %w", err))
		}
		return
	}

	logger.Logger.Debug("Permission check completed", "allowed", result.Allowed)

	handlers.NewSuccessResponse(ctx, CheckPermissionResponse{
		Allowed: result.Allowed,
	})
}

// CreateRelationshipRequest represents the request body for creating relationships
// Exactly one of subject_id or subject_set must be provided (mutually exclusive)
type CreateRelationshipRequest struct {
	// Namespace of the relationship
	Namespace *string `json:"namespace" binding:"required" example:"Tenant"`
	// Object ID in the relationship
	Object *string `json:"object" binding:"required" example:"tenant_test_123"`
	// Relation type
	Relation *string `json:"relation" binding:"required" example:"can_invite_user"`
	// Subject ID (user ID) - provide either this OR subject_id, not both
	SubjectID *string `json:"subject_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Subject set - provide either this OR subject_id, not both
	SubjectSet *SubjectSetRequest `json:"subject_set,omitempty"`
}

// CreateRelationshipResponse represents the response for creating relationships
type CreateRelationshipResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Relationship created successfully"`
	// The created relationship
	Relationship keto.Relationship `json:"relationship" binding:"required"`
}

// CreateRelationship godoc
// @Summary      Create relationship
// @Description  Creates a new relationship tuple in Ory Keto.
// @Description
// @Description  ## Authentication
// @Description  Requires session authentication.
// @Description
// @Description  ## Request Format
// @Description  Provide either `subject_id` or `subject_set` (not both).
// @Description
// @Description  ## Use Cases
// @Description  - Link resources to tenants
// @Description  - Assign users to projects
// @Description  - Create permission relationships
// @Tags         V1 Permissions
// @Accept       json
// @Produce      json
// @Param        body body CreateRelationshipRequest true "Relationship creation request"
// @Success      200 {object} handlers.SuccessResponse{data=CreateRelationshipResponse} "Relationship created successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body - namespace, object, and relation are required"
// @Failure      401 {object} handlers.UnauthorizedResponse "Not authenticated"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create relationship"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/permissions/relationships [post]
// @ID           createRelationship
func (h *PermissionsHandler) CreateRelationship(ctx *gin.Context) {
	logger.Logger.Debug("CreateRelationship handler started")

	var req CreateRelationshipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body", "error", err)
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	// Validate that exactly one of subject_id or subject_set is provided
	if req.SubjectID != nil && req.SubjectSet != nil {
		logger.Logger.Warn("Both subject_id and subject_set provided in relationship creation")
		handlers.NewBadRequestResponse(ctx, "Provide either subject_id or subject_set, not both")
		return
	}
	if req.SubjectID == nil && req.SubjectSet == nil {
		logger.Logger.Warn("Neither subject_id nor subject_set provided in relationship creation")
		handlers.NewBadRequestResponse(ctx, "Either subject_id or subject_set must be provided")
		return
	}

	logger.Logger.Debug("Creating relationship via Keto SDK",
		"namespace", *req.Namespace,
		"object", *req.Object,
		"relation", *req.Relation,
		"has_subject_id", req.SubjectID != nil,
		"has_subject_set", req.SubjectSet != nil)

	// Build the relationship body
	relationshipBody := keto.CreateRelationshipBody{
		Namespace: req.Namespace,
		Object:    req.Object,
		Relation:  req.Relation,
	}

	if req.SubjectID != nil {
		relationshipBody.SubjectId = req.SubjectID
	}

	if req.SubjectSet != nil {
		relationshipBody.SubjectSet = &keto.SubjectSet{
			Namespace: req.SubjectSet.Namespace,
			Object:    req.SubjectSet.Object,
			Relation:  req.SubjectSet.Relation,
		}
	}

	// Execute the relationship creation
	relationship, resp, err := h.ketoWriteAPI.CreateRelationship(ctx.Request.Context()).
		CreateRelationshipBody(relationshipBody).
		Execute()

	if err != nil {
		statusCode := 500
		if resp != nil {
			statusCode = resp.StatusCode
		}

		logger.Logger.Error("Failed to create relationship",
			"error", err,
			"http_status", statusCode)

		// Check if the error is a 404 from Keto (namespace or object not found)
		if statusCode == 404 {
			handlers.NewNotFoundResponse(ctx, "Namespace or object not found")
			return
		}

		// Return the same status code that Keto returned (400 for bad requests, etc.)
		if statusCode >= 400 && statusCode < 500 {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Relationship creation failed: %s", err))
		} else {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("failed to create relationship: %w", err))
		}
		return
	}

	logger.Logger.Info("Relationship created successfully",
		"namespace", *req.Namespace,
		"object", *req.Object,
		"relation", *req.Relation)

	handlers.NewSuccessResponse(ctx, CreateRelationshipResponse{
		Message:      "Relationship created successfully",
		Relationship: *relationship,
	})
}
