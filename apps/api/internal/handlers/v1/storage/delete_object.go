package storage

import (
	"context"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var DeleteObjectError = errors.New("Failed to delete file")

type DeleteObjectRequest struct {
	Path string `json:"path" required:"true" example:"test/avatars/user-123.png"`
}

type DeleteObjectResponse struct {
	Message string `json:"message"`
}

type DeleteObjectInput struct {
	handlers.AuthCtx
	Body DeleteObjectRequest
}

type DeleteObjectOutput struct {
	Body DeleteObjectResponse
}

func (h *Handler) DeleteObject(ctx context.Context, in *DeleteObjectInput) (*DeleteObjectOutput, error) {
	req := in.Body

	userID := ""
	if in.UserID != uuid.Nil {
		userID = in.UserID.String()
	}
	tenantID := ""
	if in.TenantID != uuid.Nil {
		tenantID = in.TenantID.String()
	}

	row, err := h.repo.GetStorageObjectByPath(ctx, repository.GetStorageObjectByPathParams{
		BucketName: h.bucketName,
		Path:       req.Path,
		TenantID:   &tenantID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("File not found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteObjectError, err).Error())
	}

	objectID := row.ID.String()
	subject := permissions.SubjectSet{Namespace: "User", Object: userID}
	allowed, err := h.perms.Check(ctx, "StorageObject", objectID, "delete", subject)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteObjectError, err).Error())
	}
	if !allowed {
		return nil, huma.Error403Forbidden("You do not have permission to delete this file")
	}

	if err := h.repo.DeleteStorageObjectByID(ctx, row.ID); err != nil {
		logger.Logger.Error("Failed to delete file metadata", "object_id", objectID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteObjectError, err).Error())
	}

	if _, err := h.s3.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}); err != nil {
		logger.Logger.Warn("S3 deletion failed", "bucket", h.bucketName, "key", req.Path, "error", err)
	}

	h.cleanupTuples(ctx, objectID)

	return &DeleteObjectOutput{Body: DeleteObjectResponse{Message: "file deleted"}}, nil
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
