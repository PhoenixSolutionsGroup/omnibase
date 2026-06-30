package permissions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var CreateRelationshipError = errors.New("Failed to create relationship")

type CreateRelationshipRequest struct {
	Namespace  string            `json:"namespace" binding:"required" example:"Tenant"`
	Object     string            `json:"object" binding:"required" example:"tenant_test_123"`
	Relation   string            `json:"relation" binding:"required" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
}

type CreateRelationshipResponse struct {
	Message string `json:"message" binding:"required"`
}

func (h *Handler) CreateRelationship(ctx *gin.Context) {
	var req CreateRelationshipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	err := h.perms.Create(ctx.Request.Context(), req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		if errors.Is(err, permissions.CreateNotFound) {
			handlers.NewNotFoundResponse(ctx, "Namespace or object not found")
			return
		}
		logger.Logger.Error("Failed to create relationship", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateRelationshipError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, CreateRelationshipResponse{
		Message: "Relationship created successfully",
	})
}
