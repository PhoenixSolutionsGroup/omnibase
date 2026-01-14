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
type CheckPermissionRequest struct {
	// Namespace of the relationship (required, cannot be empty)
	Namespace string `json:"namespace" binding:"required,min=1" example:"Tenant"`
	// Object ID to check permission on (required, cannot be empty)
	Object string `json:"object" binding:"required,min=1" example:"tenant_test_123"`
	// Relation to check (required, cannot be empty)
	Relation string `json:"relation" binding:"required,min=1" example:"can_invite_user"`
	// Subject set to check permission for
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
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

func (h *PermissionsHandler) CheckPermission(ctx *gin.Context) {
	logger.Logger.Debug("CheckPermission handler started")

	var req CheckPermissionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body", "error", err)
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	logger.Logger.Debug("Checking permission via Keto SDK",
		"namespace", req.Namespace,
		"object", req.Object,
		"relation", req.Relation,
		"subject_set_namespace", req.SubjectSet.Namespace,
		"subject_set_object", req.SubjectSet.Object)

	// Build the check request
	checkReq := h.ketoReadAPI.CheckPermission(ctx.Request.Context()).
		Namespace(req.Namespace).
		Object(req.Object).
		Relation(req.Relation).
		SubjectSetNamespace(req.SubjectSet.Namespace).
		SubjectSetObject(req.SubjectSet.Object).
		SubjectSetRelation(req.SubjectSet.Relation)

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
type CreateRelationshipRequest struct {
	// Namespace of the relationship
	Namespace *string `json:"namespace" binding:"required" example:"Tenant"`
	// Object ID in the relationship
	Object *string `json:"object" binding:"required" example:"tenant_test_123"`
	// Relation type
	Relation *string `json:"relation" binding:"required" example:"can_invite_user"`
	// Subject set for the relationship
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
}

// CreateRelationshipResponse represents the response for creating relationships
type CreateRelationshipResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Relationship created successfully"`
	// The created relationship
	Relationship keto.Relationship `json:"relationship" binding:"required"`
}

func (h *PermissionsHandler) CreateRelationship(ctx *gin.Context) {
	logger.Logger.Debug("CreateRelationship handler started")

	var req CreateRelationshipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body", "error", err)
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	logger.Logger.Debug("Creating relationship via Keto SDK",
		"namespace", *req.Namespace,
		"object", *req.Object,
		"relation", *req.Relation,
		"subject_set_namespace", req.SubjectSet.Namespace,
		"subject_set_object", req.SubjectSet.Object)

	// Build the relationship body
	relationshipBody := keto.CreateRelationshipBody{
		Namespace: req.Namespace,
		Object:    req.Object,
		Relation:  req.Relation,
		SubjectSet: &keto.SubjectSet{
			Namespace: req.SubjectSet.Namespace,
			Object:    req.SubjectSet.Object,
			Relation:  req.SubjectSet.Relation,
		},
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

// DeleteRelationshipRequest represents the request body for deleting relationships
type DeleteRelationshipRequest struct {
	// Namespace of the relationship
	Namespace string `json:"namespace" binding:"required" example:"Project"`
	// Object ID in the relationship
	Object string `json:"object" binding:"required" example:"project_123"`
	// Relation type
	Relation string `json:"relation" binding:"required" example:"tenant"`
	// Subject set for the relationship
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
}

// DeleteRelationshipResponse represents the response for deleting relationships
type DeleteRelationshipResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Relationship deleted successfully"`
}

func (h *PermissionsHandler) DeleteRelationship(ctx *gin.Context) {
	logger.Logger.Debug("DeleteRelationship handler started")

	var req DeleteRelationshipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request body", "error", err)
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	logger.Logger.Debug("Deleting relationship via Keto SDK",
		"namespace", req.Namespace,
		"object", req.Object,
		"relation", req.Relation,
		"subject_set_namespace", req.SubjectSet.Namespace,
		"subject_set_object", req.SubjectSet.Object)

	// Build the delete request
	deleteReq := h.ketoWriteAPI.DeleteRelationships(ctx.Request.Context()).
		Namespace(req.Namespace).
		Object(req.Object).
		Relation(req.Relation).
		SubjectSetNamespace(req.SubjectSet.Namespace).
		SubjectSetObject(req.SubjectSet.Object)

	if req.SubjectSet.Relation != "" {
		deleteReq = deleteReq.SubjectSetRelation(req.SubjectSet.Relation)
	}

	// Execute the relationship deletion
	resp, err := deleteReq.Execute()
	if err != nil {
		statusCode := 500
		if resp != nil {
			statusCode = resp.StatusCode
		}

		logger.Logger.Error("Failed to delete relationship",
			"error", err,
			"http_status", statusCode)

		// Keto returns 400 when relationship doesn't exist, treat as 404
		if statusCode == 404 || statusCode == 400 {
			handlers.NewNotFoundResponse(ctx, "Relationship not found")
			return
		}

		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("failed to delete relationship: %w", err))
		return
	}

	logger.Logger.Info("Relationship deleted successfully",
		"namespace", req.Namespace,
		"object", req.Object,
		"relation", req.Relation)

	handlers.NewSuccessResponse(ctx, DeleteRelationshipResponse{
		Message: "Relationship deleted successfully",
	})
}
