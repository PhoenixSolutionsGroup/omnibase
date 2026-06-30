package db

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/golang-migrate/migrate/v4"

	"api/internal/handlers"
	"api/internal/logger"
)

var MigrationsDownError = errors.New("Failed to roll back migrations")

type MigrationsDownResponse struct {
	Message string `json:"message" required:"true"`
}

type MigrationsDownInput struct {
	handlers.AuthCtx
	RawBody multipart.Form
}

type MigrationsDownOutput struct {
	Body MigrationsDownResponse
}

func (h *Handler) MigrationsDown(ctx context.Context, in *MigrationsDownInput) (*MigrationsDownOutput, error) {
	stepsValues := in.RawBody.Value["steps"]
	stepsStr := ""
	if len(stepsValues) > 0 {
		stepsStr = stepsValues[0]
	}
	if stepsStr == "" {
		return nil, huma.Error400BadRequest("steps is required and must be >= 1")
	}
	steps, err := strconv.Atoi(stepsStr)
	if err != nil || steps < 1 {
		return nil, huma.Error400BadRequest("steps must be a positive integer")
	}

	files := in.RawBody.File["migrations"]
	if len(files) == 0 {
		return nil, huma.Error400BadRequest("No migrations zip file provided")
	}
	fileHeader := files[0]
	if fileHeader.Size == 0 {
		return nil, huma.Error400BadRequest("Empty file provided")
	}

	dir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-down-migrations", time.Now().UnixNano()))
	defer os.RemoveAll(dir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsDownError, err).Error())
	}

	zipFile, err := fileHeader.Open()
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsDownError, err).Error())
	}
	defer zipFile.Close()

	if err := extractMigrationZip(zipFile, dir); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsDownError, err).Error())
	}

	m, err := h.migrateInstance(dir)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsDownError, err).Error())
	}
	defer m.Close()

	if err := m.Steps(-steps); err != nil {
		if err == migrate.ErrNoChange {
			return &MigrationsDownOutput{Body: MigrationsDownResponse{Message: "No migration changes applied"}}, nil
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsDownError, err).Error())
	}

	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migration down still applied)", "error", err)
	}

	return &MigrationsDownOutput{Body: MigrationsDownResponse{
		Message: fmt.Sprintf("Rolled back %d migration(s)", steps),
	}}, nil
}
