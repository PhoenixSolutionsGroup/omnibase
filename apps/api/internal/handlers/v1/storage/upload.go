package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var UploadError = errors.New("Failed to create upload")

type UploadRequest struct {
	Path     string                 `json:"path" binding:"required" example:"test/avatars/user-123.png"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

type UploadResponse struct {
	UploadURL string `json:"upload_url"`
	Path      string `json:"path"`
	ID        string `json:"id"`
}

func (h *Handler) Upload(c *gin.Context) {
	var req UploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")

	presignClient := s3.NewPresignClient(h.s3Public)
	presigned, err := presignClient.PresignPutObject(c.Request.Context(), &s3.PutObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UploadError, err))
		return
	}

	var metadataJSON []byte
	if req.Metadata != nil {
		metadataJSON, err = json.Marshal(req.Metadata)
		if err != nil {
			handlers.NewBadRequestResponse(c, "invalid metadata")
			return
		}
	} else {
		metadataJSON = []byte("{}")
	}

	tenantParam := &tenantID
	obj, err := h.repo.CreateStorageObject(c.Request.Context(), repository.CreateStorageObjectParams{
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
				handlers.NewNotFoundResponse(c, "tenant not found")
				return
			case "23505":
				handlers.NewConflictResponse(c, "file already exists at this path")
				return
			}
		}
		logger.Logger.Error("Failed to insert metadata", "path", req.Path, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UploadError, err))
		return
	}

	objectID := obj.ID.String()
	ctx := c.Request.Context()

	ownerSubject := permissions.SubjectSet{Namespace: "User", Object: userID}
	if err := h.perms.Create(ctx, "StorageObject", objectID, "owner", ownerSubject); err != nil {
		logger.Logger.Error("Failed to create owner tuple, rolling back metadata", "object_id", objectID, "error", err)
		_ = h.repo.DeleteStorageObjectByID(ctx, obj.ID)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UploadError, err))
		return
	}

	tenantSubject := permissions.SubjectSet{Namespace: "Tenant", Object: tenantID}
	if err := h.perms.Create(ctx, "StorageObject", objectID, "tenant", tenantSubject); err != nil {
		logger.Logger.Warn("Failed to create tenant tuple (non-fatal)", "object_id", objectID, "error", err)
	}

	handlers.NewSuccessResponse(c, UploadResponse{
		UploadURL: presigned.URL,
		Path:      req.Path,
		ID:        objectID,
	})
}
