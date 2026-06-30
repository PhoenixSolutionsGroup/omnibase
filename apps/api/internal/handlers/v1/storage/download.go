package storage

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var DownloadError = errors.New("Failed to create download")

type DownloadRequest struct {
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

type DownloadResponse struct {
	DownloadURL string `json:"download_url"`
}

func (h *Handler) Download(c *gin.Context) {
	var req DownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")
	ctx := c.Request.Context()

	objectID, isPublic, err := h.lookupForDownload(ctx, req.Path, tenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DownloadError, err))
		return
	}
	if objectID == "" {
		handlers.NewNotFoundResponse(c, "File not found")
		return
	}

	if !isPublic {
		subject := permissions.SubjectSet{Namespace: "User", Object: userID}
		allowed, err := h.perms.Check(ctx, "StorageObject", objectID, "read", subject)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DownloadError, err))
			return
		}
		if !allowed {
			handlers.NewForbiddenResponse(c, "Access denied")
			return
		}
	}

	presignClient := s3.NewPresignClient(h.s3Public)
	presigned, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DownloadError, err))
		return
	}

	handlers.NewSuccessResponse(c, DownloadResponse{DownloadURL: presigned.URL})
}

func (h *Handler) lookupForDownload(ctx context.Context, path, tenantID string) (string, bool, error) {
	row, err := h.repo.GetStorageObjectByPath(ctx, repository.GetStorageObjectByPathParams{
		BucketName: h.bucketName,
		Path:       path,
		TenantID:   &tenantID,
	})
	if err == nil {
		return row.ID.String(), row.IsPublic, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		logger.Logger.Error("Failed to look up file", "path", path, "error", err)
		return "", false, err
	}

	pub, err := h.repo.GetPublicStorageObjectByPath(ctx, repository.GetPublicStorageObjectByPathParams{
		BucketName: h.bucketName,
		Path:       path,
	})
	if err == nil {
		return pub.ID.String(), true, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		logger.Logger.Error("Failed to look up public file", "path", path, "error", err)
		return "", false, err
	}
	return "", false, nil
}
