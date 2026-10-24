package storage

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/authz"
	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var DownloadError = errors.New("Failed to create download")

type DownloadRequest struct {
	Path string `json:"path" required:"true" example:"test/avatars/user-123.png"`
}

type DownloadResponse struct {
	DownloadURL string `json:"download_url"`
}

type DownloadInput struct {
	handlers.AuthCtx
	Body DownloadRequest
}

type DownloadOutput struct {
	Body DownloadResponse
}

func (h *Handler) Download(ctx context.Context, in *DownloadInput) (*DownloadOutput, error) {
	req := in.Body

	tenantID := ""
	if in.TenantID != uuid.Nil {
		tenantID = in.TenantID.String()
	}

	objectID, isPublic, err := h.lookupForDownload(ctx, req.Path, tenantID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DownloadError, err).Error())
	}
	if objectID == "" {
		return nil, huma.Error404NotFound("File not found")
	}

	if !isPublic {
		if err := authz.Check(ctx, h.perms, in.Method, in.UserID, in.TenantID, "StorageObject", objectID, "read"); err != nil {
			return nil, err
		}
	}

	presignClient := s3.NewPresignClient(h.s3Public)
	presigned, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DownloadError, err).Error())
	}

	return &DownloadOutput{Body: DownloadResponse{DownloadURL: presigned.URL}}, nil
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
