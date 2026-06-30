package storage

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var MakePublicError = errors.New("Failed to make file public")

type MakePublicRequest struct {
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

type MakePublicResponse struct {
	Message string `json:"message"`
	Path    string `json:"path"`
}

func (h *Handler) MakePublic(c *gin.Context) {
	var req MakePublicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")
	ctx := c.Request.Context()

	row, err := h.repo.GetStorageObjectByPath(ctx, repository.GetStorageObjectByPathParams{
		BucketName: h.bucketName,
		Path:       req.Path,
		TenantID:   &tenantID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(c, "File not found")
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MakePublicError, err))
		return
	}

	if row.IsPublic {
		handlers.NewSuccessResponse(c, MakePublicResponse{Message: "file is already public", Path: req.Path})
		return
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userID}
	allowed, err := h.perms.Check(ctx, "StorageObject", row.ID.String(), "make_public", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MakePublicError, err))
		return
	}
	if !allowed {
		handlers.NewForbiddenResponse(c, "You do not have permission to make this file public")
		return
	}

	if err := h.repo.MarkStorageObjectPublic(ctx, row.ID); err != nil {
		logger.Logger.Error("Failed to update is_public", "object_id", row.ID, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MakePublicError, err))
		return
	}

	handlers.NewSuccessResponse(c, MakePublicResponse{Message: "file is now public", Path: req.Path})
}
