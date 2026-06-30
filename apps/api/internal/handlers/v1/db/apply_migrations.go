package db

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"

	"api/internal/handlers"
	"api/internal/logger"
)

var ApplyMigrationsError = errors.New("Failed to apply migrations")

type ApplyMigrationsResponse struct {
	Status  int    `json:"status" binding:"required"`
	Message string `json:"message" binding:"required"`
}

func (h *Handler) ApplyMigrations(c *gin.Context) {
	dir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-migrations", time.Now().UnixNano()))
	defer os.RemoveAll(dir)

	if err := os.MkdirAll(dir, 0755); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ApplyMigrationsError, err))
		return
	}

	fileHeader, err := c.FormFile("migrations")
	if err != nil {
		handlers.NewBadRequestResponse(c, "No migrations zip file provided")
		return
	}
	if fileHeader.Size == 0 {
		handlers.NewBadRequestResponse(c, "Empty file provided")
		return
	}

	zipFile, err := fileHeader.Open()
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ApplyMigrationsError, err))
		return
	}
	defer zipFile.Close()

	if err := extractMigrationZip(zipFile, dir); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ApplyMigrationsError, err))
		return
	}

	if err := h.runMigrations(c.Request.Context(), dir); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ApplyMigrationsError, err))
		return
	}

	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migrations still applied)", "error", err)
	}

	handlers.NewSuccessResponse(c, ApplyMigrationsResponse{
		Status:  200,
		Message: "Migrations applied successfully",
	})
}

func (h *Handler) runMigrations(ctx context.Context, dir string) error {
	if _, err := h.pool.Exec(ctx, `CREATE SCHEMA IF NOT EXISTS "migrations"`); err != nil {
		return fmt.Errorf("create migrations schema: %w", err)
	}

	m, err := h.migrateInstance(dir)
	if err != nil {
		return err
	}
	defer m.Close()

	prevVersion, _, prevErr := m.Version()
	hasPrev := prevErr == nil

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		version, dirty, vErr := m.Version()
		if vErr == nil && dirty {
			target := -1
			if hasPrev {
				target = int(prevVersion)
			}
			if forceErr := m.Force(target); forceErr != nil {
				return fmt.Errorf("migration failed and cleanup failed: %w (original: %v)", forceErr, err)
			}
			return fmt.Errorf("migration failed (reverted to version %d): %w", target, err)
		}
		_ = version
		return err
	}

	logger.Logger.Info("Migrations applied")
	return nil
}
