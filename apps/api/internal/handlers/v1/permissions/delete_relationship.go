package permissions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var DeleteRelationshipError = errors.New("Failed to delete relationship")

type DeleteRelationshipRequest struct {
	Namespace  string            `json:"namespace" binding:"required" example:"Tenant"`
	Object     string            `json:"object" binding:"required" example:"tenant_test_123"`
	Relation   string            `json:"relation" binding:"required" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
}

type DeleteRelationshipResponse struct {
	Message string `json:"message" binding:"required"`
}

func (h *Handler) DeleteRelationship(ctx *gin.Context) {
	var req DeleteRelationshipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	err := h.perms.Delete(ctx.Request.Context(), req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		if errors.Is(err, permissions.DeleteNotFound) {
			handlers.NewNotFoundResponse(ctx, "Relationship not found")
			return
		}
		logger.Logger.Error("Failed to delete relationship", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteRelationshipError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, DeleteRelationshipResponse{
		Message: "Relationship deleted successfully",
	})
}
