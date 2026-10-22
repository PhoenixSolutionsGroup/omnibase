package storage

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/authz"
	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var MakePublicError = errors.New("Failed to make file public")

type MakePublicRequest struct {
	Path string `json:"path" required:"true" example:"test/avatars/user-123.png"`
}

type MakePublicResponse struct {
	Message string `json:"message"`
	Path    string `json:"path"`
}

type MakePublicInput struct {
	handlers.AuthCtx
	Body MakePublicRequest
}

type MakePublicOutput struct {
	Body MakePublicResponse
}

func (h *Handler) MakePublic(ctx context.Context, in *MakePublicInput) (*MakePublicOutput, error) {
	req := in.Body

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
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MakePublicError, err).Error())
	}

	if row.IsPublic {
		return &MakePublicOutput{Body: MakePublicResponse{Message: "file is already public", Path: req.Path}}, nil
	}

	if err := authz.Check(ctx, h.perms, in.Method, in.UserID, in.TenantID, "StorageObject", row.ID.String(), "make_public"); err != nil {
		return nil, err
	}

	if err := h.repo.MarkStorageObjectPublic(ctx, row.ID); err != nil {
		logger.Logger.Error("Failed to update is_public", "object_id", row.ID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MakePublicError, err).Error())
	}

	return &MakePublicOutput{Body: MakePublicResponse{Message: "file is now public", Path: req.Path}}, nil
}
