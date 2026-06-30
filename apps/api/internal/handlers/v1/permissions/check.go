package permissions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var CheckError = errors.New("Failed to check permission")

type SubjectSetRequest struct {
	Namespace string `json:"namespace" binding:"required" example:"User"`
	Object    string `json:"object" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Relation  string `json:"relation,omitempty"`
}

type CheckRequest struct {
	Namespace  string            `json:"namespace" binding:"required,min=1" example:"Tenant"`
	Object     string            `json:"object" binding:"required,min=1" example:"tenant_test_123"`
	Relation   string            `json:"relation" binding:"required,min=1" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" binding:"required"`
}

type CheckResponse struct {
	Allowed bool `json:"allowed" binding:"required"`
}

func (h *Handler) Check(ctx *gin.Context) {
	var req CheckRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Invalid request body: %s", err))
		return
	}

	allowed, err := h.perms.Check(ctx.Request.Context(), req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		logger.Logger.Error("Failed to check permission", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CheckError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, CheckResponse{Allowed: allowed})
}
