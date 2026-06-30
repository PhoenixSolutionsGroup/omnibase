package storage

import (
	"context"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var DeleteObjectError = errors.New("Failed to delete file")

type DeleteObjectRequest struct {
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

type DeleteObjectResponse struct {
	Message string `json:"message"`
}

func (h *Handler) DeleteObject(c *gin.Context) {
	var req DeleteObjectRequest
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
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteObjectError, err))
		return
	}

	objectID := row.ID.String()
	subject := permissions.SubjectSet{Namespace: "User", Object: userID}
	allowed, err := h.perms.Check(ctx, "StorageObject", objectID, "delete", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteObjectError, err))
		return
	}
	if !allowed {
		handlers.NewForbiddenResponse(c, "You do not have permission to delete this file")
		return
	}

	if err := h.repo.DeleteStorageObjectByID(ctx, row.ID); err != nil {
		logger.Logger.Error("Failed to delete file metadata", "object_id", objectID, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteObjectError, err))
		return
	}

	if _, err := h.s3.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}); err != nil {
		logger.Logger.Warn("S3 deletion failed", "bucket", h.bucketName, "key", req.Path, "error", err)
	}

	h.cleanupTuples(ctx, objectID)

	handlers.NewSuccessResponse(c, DeleteObjectResponse{Message: "file deleted"})
}

func (h *Handler) cleanupTuples(ctx context.Context, objectID string) {
	tuples, err := h.perms.List(ctx, "StorageObject", objectID, "", nil)
	if err != nil {
		logger.Logger.Warn("Failed to list object tuples for cleanup", "object_id", objectID, "error", err)
		return
	}
	for _, t := range tuples {
		subject := permissions.SubjectSet{}
		if t.SubjectSet != nil {
			subject = *t.SubjectSet
		}
		if err := h.perms.Delete(ctx, t.Namespace, t.Object, t.Relation, subject); err != nil {
			logger.Logger.Warn("Failed to delete tuple during cleanup", "object_id", objectID, "relation", t.Relation, "error", err)
		}
	}
}

