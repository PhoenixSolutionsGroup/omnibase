package storage

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var UploadError = errors.New("Failed to create upload")

type UploadRequest struct {
	Path     string                 `json:"path" required:"true" example:"test/avatars/user-123.png"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

type UploadResponse struct {
	UploadURL string `json:"upload_url"`
	Path      string `json:"path"`
	ID        string `json:"id"`
}

type UploadInput struct {
	handlers.AuthCtx
	Body UploadRequest
}

type UploadOutput struct {
	Body UploadResponse
}

func (h *Handler) Upload(ctx context.Context, in *UploadInput) (*UploadOutput, error) {
	req := in.Body

	userID := ""
	if in.UserID != uuid.Nil {
		userID = in.UserID.String()
	}
	tenantID := ""
	if in.TenantID != uuid.Nil {
		tenantID = in.TenantID.String()
	}

	presignClient := s3.NewPresignClient(h.s3Public)
	presigned, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UploadError, err).Error())
	}

	var metadataJSON []byte
	if req.Metadata != nil {
		metadataJSON, err = json.Marshal(req.Metadata)
		if err != nil {
			return nil, huma.Error400BadRequest("invalid metadata")
		}
	} else {
		metadataJSON = []byte("{}")
	}

	tenantParam := &tenantID
	obj, err := h.repo.CreateStorageObject(ctx, repository.CreateStorageObjectParams{
		BucketName: h.bucketName,
		Path:       req.Path,
		TenantID:   tenantParam,
		UserID:     userID,
		Metadata:   metadataJSON,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23503":
				return nil, huma.Error404NotFound("tenant not found")
			case "23505":
				return nil, huma.Error409Conflict("file already exists at this path")
			}
		}
		logger.Logger.Error("Failed to insert metadata", "path", req.Path, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UploadError, err).Error())
	}

	objectID := obj.ID.String()

	ownerSubject := permissions.SubjectSet{Namespace: "User", Object: userID}
	if err := h.perms.Create(ctx, "StorageObject", objectID, "owner", ownerSubject); err != nil {
		logger.Logger.Error("Failed to create owner tuple, rolling back metadata", "object_id", objectID, "error", err)
		_ = h.repo.DeleteStorageObjectByID(ctx, obj.ID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UploadError, err).Error())
	}

	tenantSubject := permissions.SubjectSet{Namespace: "Tenant", Object: tenantID}
	if err := h.perms.Create(ctx, "StorageObject", objectID, "tenant", tenantSubject); err != nil {
		logger.Logger.Warn("Failed to create tenant tuple (non-fatal)", "object_id", objectID, "error", err)
	}

	return &UploadOutput{Body: UploadResponse{
		UploadURL: presigned.URL,
		Path:      req.Path,
		ID:        objectID,
	}}, nil
}
